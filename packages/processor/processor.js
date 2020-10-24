/* eslint-disable no-await-in-loop */
"use strict";

const path = require("path");

const Graph = require("dependency-graph").DepGraph;
const postcss = require("postcss");
const slug = require("unique-slug");
const postcssUrl = require("postcss-url");

const { compositions, fileCompositions } = require("./lib/output.js");

const message = require("./lib/message.js");
const relative = require("./lib/relative.js");
const tiered = require("./lib/graph-tiers.js");
const normalize = require("./lib/normalize.js");
const { resolvers } = require("./lib/resolve.js");

const pluginAtComposes = require("./plugins/at-composes.js");
const pluginComposition = require("./plugins/composition.js");
const pluginExternals = require("./plugins/externals.js");
const pluginGraphNodes = require("./plugins/before/graph-nodes.js");
const pluginKeyframes = require("./plugins/keyframes.js");
const pluginScoping = require("./plugins/scoping.js");
const pluginValuesImport = require("./plugins/values-import.js");
const pluginValuesLocal = require("./plugins/before/values-local.js");
const pluginValuesReplace = require("./plugins/values-replace.js");

const {
    selectorKey,
    fileKey,
    valueKey,

    filterByPrefix,

    isFile,
    isSelector,
    isValue,

    FILE_PREFIX,
} = require("./lib/keys.js");

let fs;

const noop = () => true;

const defaultLoadFile = (id) => {
    if(!fs) {
        const name = "fs";

        fs = require(name);
    }

    return fs.readFileSync(id, "utf8");
};

const params = (processor, args) => {
    const { _options } = processor;

    return {
        __proto__ : null,

        ..._options,
        ..._options.postcss,

        from : null,

        processor,

        ...args,
    };
};

const DEFAULTS = {
    cwd : process.cwd(),
    map : false,

    dupewarn  : true,
    loadFile  : defaultLoadFile,
    postcss   : {},
    resolvers : [],
    rewrite   : true,
    verbose   : false,
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
            pluginValuesLocal,
            pluginValuesReplace,
            pluginGraphNodes,
        ]);

        this._process = postcss([
            pluginAtComposes,
            pluginValuesImport,
            pluginValuesReplace,
            pluginScoping,
            pluginExternals,
            pluginComposition,
            pluginKeyframes,
            ...(options.processing || []),
        ]);

        this._after = postcss(options.after || [ noop ]);

        // Add postcss-url to the afters if requested
        if(options.rewrite) {
            this._after.use(postcssUrl(options.rewrite));
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
        const files = Array.isArray(input) ? input : [ input ];

        files.forEach((file) => {
            const normalized = this._normalize(file);
            const key = fileKey(normalized);

            if(!this._graph.hasNode(key)) {
                return;
            }

            this._graph.removeNode(key);

            delete this._files[file];

            this._log("remove()", normalized);
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

    // Mark a file and everything that depends on it as invalid
    invalidate(input) {
        if(!input) {
            throw new Error("invalidate() requires a file argument");
        }

        // Only want files actually in the array
        const normalized = this._normalize(input);
        const key = fileKey(normalized);

        if(!this._graph.hasNode(key)) {
            throw new Error(`Unknown file: ${normalized}`);
        }

        [ ...filterByPrefix(FILE_PREFIX, this._graph.dependantsOf(key)), normalized ].forEach((file) => {
            this._log("invalidate()", file);

            this._files[file].valid = false;

            this._ids.delete(file.toLowerCase());
        });
    }

    // Get the dependency order for a file or the entire tree
    dependencies(file, { leavesOnly = false, filesOnly = true } = false) {
        let results;

        if(file) {
            const normalized = this._normalize(file);
            const key = fileKey(normalized);

            if(!this._graph.hasNode(key)) {
                throw new Error(`Unknown file: ${normalized}`);
            }

            results = this._graph.dependenciesOf(key, leavesOnly);
        } else {
            results = this._graph.overallOrder(leavesOnly);
        }

        if(filesOnly) {
            return filterByPrefix(FILE_PREFIX, results);
        }

        return results;
    }

    // Get the ultimate output for specific files or the entire tree
    async output(args = false) {
        const { to } = args;
        let { files } = args;

        if(!Array.isArray(files)) {
            files = filterByPrefix(FILE_PREFIX, tiered(this._graph));
        }

        // Throw normalized values into a Set to remove dupes
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

        // Lazily-compute compositions if they're asked for
        Object.defineProperty(result, "compositions", {
            get : () => compositions(this),
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
        .then(() => compositions(this));
    }

    _addFile(file) {
        const key = fileKey(file);

        if(!this._graph.hasNode(key)) {
            // console.log("_addFile", { file });

            this._graph.addNode(key, {
                file,
                selectors : [],
                values    : [],
            });
        }

        return key;
    }

    _addSelector(file, selector) {
        const sKey = selectorKey(file, selector);

        // Ensure the file always exists
        const fKey = this._addFile(file);

        if(!this._graph.hasNode(sKey)) {
            // console.log("_addSelector", { file, selector });

            this._graph.addNode(sKey, {
                file,
                selector,
            });

            this._graph.getNodeData(fKey).selectors.push(sKey);
            this._graph.addDependency(fKey, sKey);
        }

        return sKey;
    }

    _addGlobal(selector, opts = false) {
        const file = "global";
        const key = selectorKey(file, selector);

        if(!this._graph.hasNode(key)) {
            this._graph.addNode(key, {
                file,
                selector,
                global : true,
                ...opts,
            });
        }

        return key;
    }

    _addValue(file, name, opts = false) {
        const vKey = valueKey(file, name);

        // Ensure the file always exists
        const fKey = this._addFile(file);

        if(!this._graph.hasNode(vKey)) {
            // console.log("_addValue", { file, name, opts });

            this._graph.addNode(vKey, {
                file,
                value : name,
                ...opts,
            });

            this._graph.getNodeData(fKey).values.push(vKey);
            this._graph.addDependency(fKey, vKey);
        }

        return vKey;
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

        const deps = [ ...filterByPrefix(FILE_PREFIX, this._graph.dependenciesOf(fileKey(id))), id ];

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
            const { messages } = result;

            // Pull in any classes from an @composes command
            Object.assign(file.classes, message(result, "atcomposes"));

            // export the last "classes" message that was sent
            Object.assign(file.classes, message(result, "classes"));

            // Save off anything from plugins named "modular-css-export*"
            // https://github.com/tivac/modular-css/pull/404
            Object.assign(file.exported, messages.reduce((out, { plugin, exports : exported }) => {
                if(plugin && plugin.startsWith("modular-css-export") && exported) {
                    Object.assign(out, exported);
                }

                return out;
            }, Object.create(null)));
        }

        const self = this;

        return {
            __proto__ : null,

            id,
            details : this._files[id],

            // Lazily-compute compositions if they're asked for
            get exports() {
                return fileCompositions(this.details, self);
            },
        };
    }

    // Process files and walk their composition/value dependency tree to find
    // new files we need to process
    async _walk(name, src) {
        const { _graph : graph, _files : files } = this;

        // No need to re-process files unless they've been marked invalid
        if(files[name] && files[name].valid) {
            // Do want to wait until they're done being processed though
            await files[name].walked;

            return;
        }

        const fKey = this._addFile(name);

        this._log("_before()", name);

        let walked;

        const file = files[name] = {
            name,
            text  : typeof src === "string" ? src : src.source.input.css,
            valid : true,

            classes  : Object.create(null),
            values   : Object.create(null),
            exported : Object.create(null),

            walked : new Promise((done) => (walked = done)),

            before : this._before.process(
                src,
                params(this, {
                    from : name,
                })
            ),
        };

        await file.before;

        // Add all the found dependencies to the graph
        file.before.messages.forEach(({ plugin, selector, refs = [], dependency }) => {
            /* istanbul ignore if */
            if(plugin !== pluginGraphNodes.postcssPlugin) {
                return;
            }

            const dep = this._normalize(dependency);
            const dKey = this._addFile(dep);

            graph.addDependency(fKey, dKey);

            // @values don't have a selector field
            if(!selector) {
                refs.forEach(({ name : depValue }) => {
                    this._addValue(dep, depValue);
                });

                return;
            }

            // Add selector and its dependencies to the graph
            const selectorId = selectorKey(name, selector);

            // Remove any existing dependencies for the selector
            if(graph.hasNode(selectorId)) {
                graph.dependenciesOf(selectorId).forEach((other) => {
                    graph.removeDependency(selectorId, other);
                });
            }

            this._addSelector(name, selector);

            refs.forEach(({ name : depSelector }) => {
                const depSelectorId = this._addSelector(dep, depSelector);

                graph.addDependency(selectorId, depSelectorId);
            });
        });

        // Walk this node's dependencies, reading new files from disk as necessary
        await Promise.all(
            filterByPrefix(FILE_PREFIX, graph.dependenciesOf(fKey)).map((dependency) => {
                const { valid, walked : complete } = files[dependency] || false;

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

// Static exports of key.js functionality
Processor.selectorKey = selectorKey;
Processor.fileKey = fileKey;
Processor.valueKey = valueKey;

Processor.isFile = isFile;
Processor.isSelector = isSelector;
Processor.isValue = isValue;

module.exports = Processor;
