"use strict";

const fs   = require("fs");
const path = require("path");
    
const Graph     = require("dependency-graph").DepGraph;
const postcss   = require("postcss");
const slug      = require("unique-slug");
const series    = require("p-each-series");
const mapValues = require("lodash/mapValues");

const output   = require("./lib/output.js");
const message  = require("./lib/message.js");
const relative = require("./lib/relative.js");
const tiered   = require("./lib/graph-tiers.js");
const resolve  = require("./lib/resolve.js");
const normalize  = require("./lib/normalize.js");

const noop = () => true;

function params(processor, args) {
    return Object.assign(
        Object.create(null),
        processor._options,
        {
            from    : null,
            files   : processor._files,
            graph   : processor._graph,
            resolve : processor._resolve,
        },
        args
    );
}

class Processor {
    constructor(opts) {
        /* eslint max-statements: [ "warn", 25 ] */
        const options = Object.assign(
            Object.create(null),
            {
                cwd       : process.cwd(),
                map       : false,
                rewrite   : true,
                verbose   : false,
                resolvers : [],
            },
            opts
        );

        this._options = options;

        if(!path.isAbsolute(options.cwd)) {
            options.cwd = path.resolve(options.cwd);
        }

        if(typeof options.namer === "string") {
            options.namer = require(options.namer)();
        }

        if(typeof options.namer !== "function") {
            options.namer = (file, selector) =>
                `mc${slug(relative(options.cwd, file))}_${selector}`;
        }

        this._log = options.verbose ?
            // eslint-disable-next-line no-console
            console.log.bind(console, "[processor]") :
            // eslint-disable-next-line no-empty-function
            () => {};

        this._resolve = resolve.resolvers(options.resolvers);

        this._absolute = (file) => (path.isAbsolute(file) ? file : path.join(options.cwd, file));

        this._files = Object.create(null);
        this._graph = new Graph();

        this._before = postcss([
            ...(options.before || []),
            require("./plugins/values-local.js"),
            require("./plugins/values-export.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/graph-nodes.js"),
        ]);

        this._process = postcss([
            require("./plugins/values-composed.js"),
            require("./plugins/values-imported.js"),
            require("./plugins/values-export.js"),
            require("./plugins/values-namespaced.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/scoping.js"),
            require("./plugins/externals.js"),
            require("./plugins/composition.js"),
            require("./plugins/keyframes.js"),
            ...(options.processing || []),
        ]);

        this._after = postcss(options.after || [ noop ]);

        // Add postcss-url to the afters if requested
        if(options.rewrite) {
            this._after.use(require("postcss-url")(options.rewrite));
        }

        this._done = postcss(options.done || [ noop ]);
    }

    // Add a file on disk to the dependency graph
    file(file) {
        this._log("file()", file);
        
        return this.string(file, fs.readFileSync(file, "utf8"));
    }
    
    // Add a file by name + contents to the dependency graph
    async string(start, text) {
        this._log("string()", start);
        
        const id = await this._walk(start, text);
        
        const deps = this._graph.dependenciesOf(id).concat(id);
        
        await series(deps, async (dep) => {
            const file = this._files[dep];
            
            if(!file.processed) {
                this._log("processing", dep);

                file.processed = this._process.process(
                    file.result,
                    params(this, {
                        from  : dep,
                        namer : this._options.namer,
                    })
                );
            }
            
            const result = await file.processed;

            this._log("processed", dep);
            
            file.result = result;
            
            file.exports = Object.assign(
                Object.create(null),
                // export @value entries
                mapValues(file.values, (obj) => obj.value),
                
                // export classes
                message(result, "classes"),
                
                // Export anything from plugins named "modular-css-export*"
                result.messages.reduce((out, msg) => {
                    if(msg.plugin.indexOf("modular-css-export") !== 0) {
                        return out;
                    }

                    return Object.assign(out, msg.exports);
                }, Object.create(null))
            );
        });

        this._log("string() done", id);
        
        return {
            id,
            file    : id,
            files   : this._files,
            details : this._files[id],
            exports : this._files[id].exports,
        };
    }
    
    // Remove a file from the dependency graph
    remove(input) {
        // Only want files actually in the array
        const files = (Array.isArray(input) ? input : [ input ])
            .map(this._absolute)
            .filter((file) => this._graph.hasNode(file));
        
        if(!files.length) {
            return files;
        }

        files.forEach((file) => {
            delete this._files[file];

            this._graph.removeNode(file);

            this._log("remove()", file);
        });

        return files;
    }
    
    // Get the dependency order for a file or the entire tree
    dependencies(file) {
        if(file) {
            return this._graph.dependenciesOf(
                file
            );
        }

        return this._graph.overallOrder();
    }
    
    // Get the dependant files for a file
    dependents(file) {
        if(!file) {
            throw new Error("Must provide a file to processor.dependants()");
        }
        
        return this._graph.dependantsOf(
            file
        );
    }
    
    // Get the ultimate output for specific files or the entire tree
    async output(args = false) {
        let { files } = args;
        
        if(!Array.isArray(files)) {
            files = tiered(this._graph);
        }

        // Throw normalize values into a Set to remove dupes
        files = new Set(files.map(normalize.bind(null, this._options.cwd)));

        // Then turn it back into array because the iteration story is better
        files = [ ...files.values() ];

        // Verify that all requested files have been fully processed & succeeded
        // See
        //  - https://github.com/tivac/modular-css/issues/248
        //  - https://github.com/tivac/modular-css/issues/324
        await Promise.all(
            files.map((file) => {
                if(!this._files[file]) {
                    throw new Error(`Unknown file requested: ${file}`);
                }

                return this._files[file].result;
            })
        );

        // Rewrite relative URLs before adding
        // Have to do this every time because target file might be different!
        //
        const results = [];
        
        // Use for of loop so await works correctly
        for(const dep of files) {
            // eslint-disable-next-line no-await-in-loop
            const result = await this._after.process(
                // NOTE: the call to .clone() is really important here, otherwise this call
                // modifies the .result root itself and you process URLs multiple times
                // See https://github.com/tivac/modular-css/issues/35
                //
                this._files[dep].result.root.clone(),
                
                params(this, {
                    from : dep,
                    to   : args.to,
                })
            );

            results.push(result);
        }

        // Clone the first result if available to get valid source information
        const root = results.length ? results[0].root.clone() : postcss.root();

        // Then destroy all its children before adding new ones
        root.removeAll();

        results.forEach((result) => {
            // Add file path comment
            const comment = postcss.comment({
                text : relative(this._options.cwd, result.opts.from),

                // Add a bogus-ish source property so postcss won't make weird-looking
                // source-maps that break the visualizer
                //
                // https://github.com/postcss/postcss/releases/tag/5.1.0
                // https://github.com/postcss/postcss/pull/761
                // https://github.com/tivac/modular-css/pull/157
                //
                source : Object.assign(
                    {},
                    result.root.source,
                    { end : result.root.source.start }
                ),
            });

            root.append([ comment ].concat(result.root.nodes));
            
            const idx = root.index(comment);
            
            // Need to manually insert a newline after the comment, but can only
            // do that via whatever comes after it for some reason?
            // I'm not clear why comment nodes lack a `.raws.after` property
            //
            // https://github.com/postcss/postcss/issues/44
            if(root.nodes[idx + 1]) {
                root.nodes[idx + 1].raws.before = "\n";
            }
        });
        
        const result = await this._done.process(
            root,
            params(this, args)
        );

        result.compositions = output.compositions(this._options.cwd, this);
            
        return result;
    }
    
    // Expose files
    get files() {
        return this._files;
    }

    // Expose combined options object
    get options() {
        return this._options;
    }

    // Process files and walk their composition/value dependency tree to find
    // new files we need to process
    async _walk(name, text) {
        const id = normalize(this._options.cwd, name);

        // No need to re-process files
        if(this._files[id]) {
            return id;
        }

        this._graph.addNode(id);

        this._files[id] = {
            text,
            exports : false,
            values  : false,
        };
        
        const result = await this._before.process(
            text,
            params(this, {
                from : id,
            })
        );

        this._files[id].result = result;

        // Walk this node's dependencies, reading new files from disk as necessary
        await Promise.all(
            this._graph.dependenciesOf(id).map((dependency) => this._walk(
                dependency,
                this._files[dependency] ?
                    null :
                    fs.readFileSync(dependency, "utf8")
            ))
        );

        return id;
    }
}

module.exports = Processor;
