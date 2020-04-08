/* eslint-disable no-await-in-loop */
"use strict";

const path = require("path");

const Graph     = require("dependency-graph").DepGraph;
const postcss   = require("postcss");
const slug      = require("unique-slug");
const mapValues = require("lodash/mapValues");

const output        = require("./lib/output.js");
const message       = require("./lib/message.js");
const relative      = require("./lib/relative.js");
const tiered        = require("./lib/graph-tiers.js");
const normalize     = require("./lib/normalize.js");
const { resolvers } = require("./lib/resolve.js");

let fs;

const noop = () => true;

const defaultLoadFile = (id) => {
    if(!fs) {
        const name = "fs";
        
        fs = require(name);
    }
    
    return fs.readFileSync(id, "utf8");
};

const params = ({ _options, _files, _graph, _resolve }, args) => ({
    __proto__ : null,
    ..._options,
    ..._options.postcss,
    from      : null,
    files     : _files,
    graph     : _graph,
    resolve   : _resolve,
    ...args,
});

const DEFAULTS = {
    cwd : process.cwd(),
    map : false,

    dupewarn     : true,
    exportValues : true,
    loadFile     : defaultLoadFile,
    postcss      : {},
    resolvers    : [],
    rewrite      : true,
    verbose      : false,
};

class Processor {
    constructor(opts = {}) {
        /* eslint max-statements: [ "warn", 25 ] */
        const options = {
            __proto__ : null,
            ...DEFAULTS,
            ...opts,
        };

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

        this._loadFile = options.loadFile;

        this._resolve = resolvers(options.resolvers);

        this._normalize = normalize.bind(null, this._options.cwd);

        this._files = Object.create(null);
        this._graph = new Graph();
        this._ids = new Map();

        this._before = postcss([
            ...(options.before || []),
            require("./plugins/before/values-local.js"),
            require("./plugins/values-replace.js"),
            require("./plugins/before/graph-nodes.js"),
        ]);

        this._process = postcss([
            require("./plugins/at-composes.js"),
            require("./plugins/values-import.js"),
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
    async file(file) {
        const id = this._normalize(file);

        this._log("file()", id);

        const text = await this._loadFile(id);

        return this._add(id, text);
    }

    // Add a file by name + contents to the dependency graph
    string(file, text) {
        const id = this._normalize(file);

        this._log("string()", id);

        return this._add(id, text);
    }

    // Add an existing postcss Root object by name
    root(file, root) {
        const id = this._normalize(file);

        this._log("root()", id);

        return this._add(id, root);
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

    // Return the corrected-path version of the file
    normalize(file) {
        return this._normalize(file);
    }

    // Resolve a file from a src using the configured resolvers
    resolve(src, file) {
        return this._resolve(src, file);
    }

    // Check if a file exists in the currently-processed set
    has(input) {
        const file = this._normalize(input);

        return file in this._files;
    }

    // Mark a file and everything that depends on it as invalid so
    // it can be overwritten
    invalidate(input) {
        if(!input) {
            throw new Error("invalidate() requires a file argument");
        }

        // Only want files actually in the array
        const source = this._normalize(input);

        if(!this._graph.hasNode(source)) {
            throw new Error(`Unknown file: ${input}`);
        }

        const deps = this.dependents(source);

        [ ...deps, source ].forEach((file) => {
            this._log("invalidate()", file);

            this._files[file].valid = false;

            this._ids.delete(file.toLowerCase());
        });
    }

    // Get the dependency order for a file or the entire tree
    dependencies(file, options = false) {
        const { leavesOnly } = options;

        if(file) {
            const id = this._normalize(file);

            return this._graph.dependenciesOf(id, leavesOnly);
        }

        return this._graph.overallOrder(leavesOnly);
    }

    // Get the dependant files for a file
    dependents(file, options = false) {
        if(!file) {
            throw new Error("Must provide a file to processor.dependants()");
        }

        const id = this._normalize(file);
        const { leavesOnly } = options;

        return this._graph.dependantsOf(id, leavesOnly);
    }

    // Get the ultimate output for specific files or the entire tree
    async output(args = false) {
        const { to } = args;
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
        const results = [];

        for(const dep of files) {
            this._log("_after()", dep);

            const result = await this._after.process(
                // NOTE: the call to .clone() is really important here, otherwise this call
                // modifies the .result root itself and you process URLs multiple times
                // See https://github.com/tivac/modular-css/issues/35
                this._files[dep].result.root.clone(),

                params(this, {
                    from : dep,
                    to,
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
                source : {
                    __proto__ : null,

                    ...result.root.source,
                    end : result.root.source.start,
                },
            });

            root.append([ comment, ...result.root.nodes ]);

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
            get : () => output.compositions(this),
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

    // Expose the dependency graph
    get graph() {
        return this._graph;
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
    async _add(id, src) {
        const check = id.toLowerCase();

        // Warn about potential dupes if an ID goes past we've seen before
        if(this._options.dupewarn) {
            const other = this._ids.get(check);

            if(other && other !== id) {
                // eslint-disable-next-line no-console
                console.warn(`POTENTIAL DUPLICATE FILES:\n\t${relative(this._options.cwd, other)}\n\t${relative(this._options.cwd, id)}`);
            }
        }

        this._ids.set(check, id);

        this._log("_add()", id);

        await this._walk(id, src);

        const deps = [ ...this._graph.dependenciesOf(id), id ];

        for(const dep of deps) {
            const file = this._files[dep];

            if(!file.processed) {
                this._log("_process()", dep);

                file.processed = this._process.process(
                    file.before,
                    params(this, {
                        from  : dep,
                        namer : this._options.namer,
                    })
                );
            }

            file.result = await file.processed;

            const { result } = file;

            file.exports = {
                __proto__ : null,

                // optionally export @value entries
                ...(
                    this._options.exportValues ?
                        mapValues(file.values, ({ value }) => value) :
                        null
                ),

                // export classes
                ...message(result, "classes"),

                // Export anything from plugins named "modular-css-export*"
                ...result.messages.reduce((out, { plugin, exports : exported }) => {
                    if(!plugin || plugin.indexOf("modular-css-export") !== 0) {
                        return out;
                    }

                    return Object.assign(out, exported);
                }, Object.create(null)),
            };
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
    async _walk(name, src) {
        // No need to re-process files unless they've been marked invalid
        if(this._files[name] && this._files[name].valid) {
            // Do want to wait until they're done being processed though
            await this._files[name].walked;

            return;
        }

        this._graph.addNode(name, 0);

        this._log("_before()", name);

        let walked;

        const file = this._files[name] = {
            text    : typeof src === "string" ? src : src.source.input.css,
            exports : false,
            values  : false,
            valid   : true,
            before  : this._before.process(
                src,
                params(this, {
                    from : name,
                })
            ),
            walked : new Promise((done) => (walked = done)),
        };

        await file.before;

        // Add all the found dependencies to the graph
        file.before.messages.forEach(({ plugin, dependency }) => {
            if(plugin !== "modular-css-graph-nodes") {
                return;
            }

            const dep = this._normalize(dependency);

            this._graph.addNode(dep, 0);
            this._graph.addDependency(name, dep);
        });

        // Walk this node's dependencies, reading new files from disk as necessary
        await Promise.all(
            this._graph.dependenciesOf(name).map((dependency) => {
                const { valid, walked : complete } = this._files[dependency] || false;

                // If the file hasn't been invalidated wait for it to be done processing
                if(valid) {
                    return complete;
                }

                // Otherwise add it to the queue
                return this.file(dependency);
            })
        );

        // Mark the walk of this file & its dependencies complete
        walked();
    }
}

module.exports = Processor;
