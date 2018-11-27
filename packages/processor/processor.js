"use strict";

const fs   = require("fs");
const path = require("path");

const Graph     = require("dependency-graph").DepGraph;
const postcss   = require("postcss");
const slug      = require("unique-slug");
const mapValues = require("lodash/mapValues");

const output    = require("./lib/output.js");
const message   = require("./lib/message.js");
const relative  = require("./lib/relative.js");
const tiered    = require("./lib/graph-tiers.js");
const resolve   = require("./lib/resolve.js");
const normalize = require("./lib/normalize.js");

const noop = () => true;

const params = ({ _options, _files, _graph, _resolve }, args) => Object.assign(
    Object.create(null),
    _options,
    {
        from    : null,
        files   : _files,
        graph   : _graph,
        resolve : _resolve,
    },
    args
);

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

        this._normalize = normalize.bind(null, this._options.cwd);

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
        const id = this._normalize(file);

        this._log("file()", id);

        return this._add(id, fs.readFileSync(id, "utf8"));
    }

    // Add a file by name + contents to the dependency graph
    async string(file, text) {
        const id = this._normalize(file);

        this._log("string()", id);

        return this._add(id, text);
    }

    // Remove a file from the dependency graph
    remove(input) {
        // Only want files actually in the array
        const files = (Array.isArray(input) ? input : [ input ])
            .map(this._normalize)
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
            const id = this._normalize(file);

            return this._graph.dependenciesOf(id);
        }

        return this._graph.overallOrder();
    }

    // Get the dependant files for a file
    dependents(file) {
        if(!file) {
            throw new Error("Must provide a file to processor.dependants()");
        }

        const id = this._normalize(file);

        return this._graph.dependantsOf(id);
    }

    // Get the ultimate output for specific files or the entire tree
    async output(args = false) {
        let { files } = args;

        if(!Array.isArray(files)) {
            files = tiered(this._graph);
        }

        // Throw normalize values into a Set to remove dupes
        files = new Set(files.map(this._normalize));

        // Then turn it back into array because the iteration story is better
        files = [ ...files.values() ];

        // Verify that all requested files have been fully processed & succeeded
        // See
        //  - https://github.com/tivac/modular-css/issues/248
        //  - https://github.com/tivac/modular-css/issues/324
        await Promise.all(files.map((file) => {
            if(!this._files[file]) {
                throw new Error(`Unknown file requested: ${file}`);
            }

            return this._files[file].result;
        }));

        // Rewrite relative URLs before adding
        // Have to do this every time because target file might be different!
        //
        const results = [];

        for(const dep of files) {
            // eslint-disable-next-line no-await-in-loop
            const result = await this._after.process(
                // NOTE: the call to .clone() is really important here, otherwise this call
                // modifies the .result root itself and you process URLs multiple times
                // See https://github.com/tivac/modular-css/issues/35
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

        Object.defineProperty(result, "compositions", {
            get : () => output.compositions(this)
        });

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

    // Return all the compositions for the files loaded into the processor instance
    get compositions() {
        // Ensure all files are fully-processed first
        return Promise.all(
            Object.values(this._files).map(({ result }) => result)
        )
        .then(() => output.compositions(this));
    }

    // Take a file id and some text, walk it for dependencies, then
    // process and return details
    async _add(id, text) {
        this._log("_add()", id);

        await this._walk(id, text);

        const deps = this._graph.dependenciesOf(id).concat(id);

        for(const dep of deps) {
            const file = this._files[dep];

            if(!file.processed) {
                this._log("_add() processing", dep);

                file.processed = this._process.process(
                    file.result,
                    params(this, {
                        from  : dep,
                        namer : this._options.namer,
                    })
                );
            }

            // eslint-disable-next-line no-await-in-loop
            file.result = await file.processed;

            const { result } = file;

            file.exports = Object.assign(
                Object.create(null),
                // export @value entries
                mapValues(file.values, ({ value }) => value),

                // export classes
                message(result, "classes"),

                // Export anything from plugins named "modular-css-export*"
                result.messages.reduce((out, { plugin, exports : exported }) => {
                    if(plugin.indexOf("modular-css-export") !== 0) {
                        return out;
                    }

                    return Object.assign(out, exported);
                }, Object.create(null))
            );
        }

        return {
            id,
            file    : id,
            files   : this._files,
            details : this._files[id],
            exports : this._files[id].exports,
        };
    }

    // Process files and walk their composition/value dependency tree to find
    // new files we need to process
    async _walk(name, text) {
        // No need to re-process files
        if(this._files[name]) {
            return;
        }

        this._graph.addNode(name);

        const file = this._files[name] = {
            text,
            exports : false,
            values  : false,
            result  : this._before.process(
                text,
                params(this, {
                    from : name,
                })
            ),
        };

        await file.result;

        // Add all the found dependencies to the graph
        file.result.messages.forEach(({ plugin, dependency }) => {
            if(plugin !== "modular-css-graph-nodes") {
                return;
            }

            const dep = this._normalize(dependency);

            this._graph.addNode(dep);
            this._graph.addDependency(name, dep);
        });

        // Walk this node's dependencies, reading new files from disk as necessary
        await Promise.all(
            this._graph.dependenciesOf(name).reduce((promises, dependency) => {
                if(!this._files[dependency]) {
                    promises.push(this.file(dependency));
                }

                return promises;
            }, [])
        );
    }
}

module.exports = Processor;
