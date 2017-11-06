"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    Graph   = require("dependency-graph").DepGraph,
    postcss = require("postcss"),
    slug    = require("unique-slug"),
    series  = require("p-each-series"),
    unique  = require("lodash.uniq"),

    output   = require("./lib/output.js"),
    message  = require("./lib/message.js"),
    relative = require("./lib/relative.js"),
    tiered   = require("./lib/graph-tiers.js"),
    resolve  = require("./lib/resolve.js");

function params(processor, args) {
    return Object.assign(
        Object.create(null),
        processor._options,
        {
            files   : processor._files,
            graph   : processor._graph,
            resolve : processor._resolve
        },
        args || Object.create(null)
    );
}

function Processor(opts) {
    /* eslint consistent-return: off, max-statements: off */
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }
    
    this._options = Object.assign(
        Object.create(null),
        {
            cwd : process.cwd(),
            map : false
        },
        opts || Object.create(null)
    );

    if(!path.isAbsolute(this._options.cwd)) {
        this._options.cwd = path.resolve(this._options.cwd);
    }
    
    if(typeof this._options.namer === "string") {
        this._options.namer = require(this._options.namer)();
    }

    if(typeof this._options.namer !== "function") {
        this._options.namer = (file, selector) =>
            `mc${slug(relative(this._options.cwd, file))}_${selector}`;
    }

    if(!Array.isArray(this._options.resolvers)) {
        this._options.resolvers = [];
    }

    this._resolve = resolve.resolvers(this._options.resolvers);
    
    this._absolute = (file) => (path.isAbsolute(file) ? file : path.join(this._options.cwd, file));

    this._files = Object.create(null);
    this._graph = new Graph();
    
    this._before = postcss((this._options.before || []).concat(
        require("./plugins/values-local.js"),
        require("./plugins/values-export.js"),
        require("./plugins/values-replace.js"),
        require("./plugins/graph-nodes.js")
    ));

    this._process = postcss([
        require("./plugins/values-composed.js"),
        require("./plugins/values-imported.js"),
        require("./plugins/values-export.js"),
        require("./plugins/values-namespaced.js"),
        require("./plugins/values-replace.js"),
        require("./plugins/scoping.js"),
        require("./plugins/externals.js"),
        require("./plugins/composition.js"),
        require("./plugins/keyframes.js")
    ]);
    
    this._after = postcss(this._options.after || [
        require("postcss-url")
    ]);
    
    this._done = postcss(this._options.done || []);
}

Processor.prototype = {
    // Add a file on disk to the dependency graph
    file : function(file) {
        if(!path.isAbsolute(file)) {
            file = path.join(this._options.cwd, file);
        }

        return this.string(path.normalize(file), fs.readFileSync(file, "utf8"));
    },
    
    // Add a file by name + contents to the dependency graph
    string : function(start, text) {
        if(!path.isAbsolute(start)) {
            start = path.join(this._options.cwd, start);
        }
        
        return this._walk(start, text).then(() => {
            var deps = this._graph.dependenciesOf(start).concat(start);
            
            return series(deps, (dep) => {
                var file = this._files[dep];
                
                if(!file.processed) {
                    file.processed = this._process.process(
                        file.result,
                        params(this, {
                            from  : dep,
                            namer : this._options.namer
                        })
                    );
                }
                
                return file.processed.then((result) => {
                    file.exports = message(result, "classes");
                    file.result  = result;
                });
            });
        })
        .then(() => ({
            id      : start,
            file    : start,
            files   : this._files,
            details : this._files[start],
            exports : this._files[start].exports
        }));
    },
    
    // Remove a file from the dependency graph
    remove : function(input) {
        var order = this._graph.overallOrder(),
            files;
        
        // Only want files actually in the array
        files = (Array.isArray(input) ? input : [ input ])
            .map(this._absolute)
            .filter((file) => this._graph.hasNode(file));
        
        if(!files.length) {
            return;
        }

        // Remove everything that depends on files to be removed as well
        // since it will also have to be recalculated
        files = files
            .reduce(
                (prev, curr) => prev.concat(
                    this._graph.dependantsOf(curr)
                        .concat(curr)
                ),
                []
            )
            .sort((a, b) => order.indexOf(a) - order.indexOf(b));

        unique(files).forEach((file) => {
            delete this._files[file];

            this._graph.removeNode(file);
        });
    },
    
    // Get the dependency order for a file or the entire tree
    dependencies : function(file) {
        if(file) {
            return this._graph.dependenciesOf(
                file
            );
        }

        return this._graph.overallOrder();
    },
    
    // Get the ultimate output for specific files or the entire tree
    output : function(args) {
        var opts  = args || false,
            files = opts.files,
            ready;
        
        if(!Array.isArray(files)) {
            files = tiered(this._graph);
        }

        files = files.map(this._absolute);

        // Verify that all requested files have been fully processed & succeeded
        // See
        //  - https://github.com/tivac/modular-css/issues/248
        //  - https://github.com/tivac/modular-css/issues/324
        ready = files.every((dep) =>
            dep in this._files && this._files[dep].result
        );

        if(!ready) {
            return Promise.reject(new Error("File processing not complete"));
        }

        // Rewrite relative URLs before adding
        // Have to do this every time because target file might be different!
        //
        return Promise.all(
            files.map((dep) => this._after.process(
                // NOTE: the call to .clone() is really important here, otherwise this call
                // modifies the .result root itself and you process URLs multiple times
                // See https://github.com/tivac/modular-css/issues/35
                //
                this._files[dep].result.root.clone(),
                
                params(this, {
                    from : dep,
                    to   : opts.to
                })
            ))
        )
        .then((results) => {
            // Clone the first result if available to get valid source information
            var root = results.length ? results[0].root.clone() : postcss.root();

            // Then destroy all its children before adding new ones
            root.removeAll();

            results.forEach((result) => {
                // Add file path comment
                var comment = postcss.comment({
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
                        )
                    }),
                    idx;

                root.append([ comment ].concat(result.root.nodes));
                
                idx = root.index(comment);
                
                // Need to manually insert a newline after the comment, but can only
                // do that via whatever comes after it for some reason?
                // I'm not clear why comment nodes lack a `.raws.after` property
                //
                // https://github.com/postcss/postcss/issues/44
                if(root.nodes[idx + 1]) {
                    root.nodes[idx + 1].raws.before = "\n";
                }
            });
            
            return this._done.process(
                root,
                params(this, args)
            );
        })
        .then((result) => {
            result.compositions = output.compositions(this._options.cwd, this);
            
            return result;
        });
    },
    
    // Expose files
    get files() {
        return this._files;
    },

    // Expose combined options object
    get options() {
        return this._options;
    },

    // Process files and walk their composition/value dependency tree to find
    // new files we need to process
    _walk : function(name, text) {
        // No need to re-process files
        if(this._files[name]) {
            return Promise.resolve();
        }
        
        this._graph.addNode(name);

        this._files[name] = {
            text    : text,
            exports : false,
            values  : false
        };
        
        return this._before.process(
            text,
            params(this, {
                from : name
            })
        )
        .then((result) => {
            this._files[name].result = result;

            // Walk this node's dependencies, reading new files from disk as necessary
            return Promise.all(
                this._graph.dependenciesOf(name).map((dependency) => this._walk(
                    dependency,
                    this._files[dependency] ?
                        null :
                        fs.readFileSync(dependency, "utf8")
                ))
            );
        });
    }
};

module.exports = Processor;
