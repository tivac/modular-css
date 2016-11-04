"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    Graph    = require("dependency-graph").DepGraph,
    postcss  = require("postcss"),
    slug     = require("unique-slug"),

    output     = require("./lib/output.js"),
    message    = require("./lib/message.js"),
    relative   = require("./lib/relative.js"),
    cloneGraph = require("./lib/clone-graph.js"),
    sequential = require("./lib/sequential.js");

function namer(cwd, file, selector) {
    return "mc" + slug(relative(cwd, file)) + "_" + selector;
}

function Processor(opts) {
    /* eslint consistent-return:0 */
    var options = opts;
    
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }
    
    this._options = Object.assign({
        cwd    : process.cwd(),
        map    : false,
        strict : true
    }, options || Object.create(null));

    if(typeof this._options.namer !== "function") {
        this._options.namer = namer.bind(null, this._options.cwd);
    }
    
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
        require("./plugins/values-export.js"),
        require("./plugins/values-namespaced.js"),
        require("./plugins/values-replace.js"),
        require("./plugins/scoping.js"),
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
        return this.string(file, fs.readFileSync(file, "utf8"));
    },
    
    // Add a file by name + contents to the dependency graph
    string : function(name, text) {
        var self  = this,
            start = path.resolve(name);
        
        return this._walk(start, text).then(() => {
            var deps = self._graph.dependenciesOf(start).concat(start);
            
            return sequential(deps.map((dep) =>
                () => {
                    var file = self._files[dep];
                    
                    if(!file.processed) {
                        file.processed = self._process.process(
                            file.result,
                            Object.assign(
                                Object.create(null),
                                self._options,
                                {
                                    from  : dep,
                                    files : self._files,
                                    namer : self._options.namer
                                }
                            )
                        );
                    }
                    
                    return file.processed.then((result) => {
                        file.exports = message(result, "classes");
                        file.result  = result;
                    });
                }
            ));
        })
        .then(() => ({
            id      : start,
            file    : start,
            files   : self._files,
            exports : self._files[start].exports
        }));
    },
    
    // Remove a file from the dependency graph
    remove : function(input, options) {
        var self  = this,
            files = input;

        if(!Array.isArray(files)) {
            files = [ files ];
        }
        
        if(!options) {
            options = false;
        }

        files.filter((key) => self._graph.hasNode(key)).forEach((key) => {
            if(!options.shallow) {
                // Remove everything that depends on this too, it'll all need
                // to be recalculated
                self.remove(self._graph.dependantsOf(key));
            }

            delete self._files[key];
            
            self._graph.removeNode(key);
        });
    },
    
    // Get the dependency order for a file or the entire tree
    dependencies : function(file) {
        if(file) {
            return this._graph.dependenciesOf(
                path.normalize(file)
            );
        }

        return this._graph.overallOrder();
    },
    
    // Get the ultimate output for specific files or the entire tree
    output : function(args) {
        var self  = this,
            opts  = args || false,
            files = opts.files,
            clone, tier;
        
        if(!Array.isArray(files)) {
            clone = cloneGraph(this._graph);
            files = [];
            
            while(Object.keys(clone.nodes).length) {
                tier = clone.overallOrder(true);
                
                tier.forEach((node) => {
                    clone.dependantsOf(node).forEach(
                        (dep) => clone.removeDependency(dep, node)
                    );
                    
                    clone.removeNode(node);
                });
                
                files = files.concat(tier.sort());
            }
        }
        
        // Rewrite relative URLs before adding
        // Have to do this every time because target file might be different!
        //
        return Promise.all(files.map((dep) => self._after.process(
            // NOTE: the call to .clone() is really important here, otherwise this call
            // modifies the .result root itself and you process URLs multiple times
            // See https://github.com/tivac/modular-css/issues/35
            //
            self._files[dep].result.root.clone(),
            
            Object.assign(
                Object.create(null),
                self._options,
                {
                    from : dep,
                    to   : opts.to
                }
            )
        )))
        .then((results) => {
            var root = postcss.root();

            results.forEach((result) => {
                var comment;
                
                self._warnings(result);

                comment = postcss.comment({
                    text : relative(self._options.cwd, result.opts.from)
                });

                // Add a bogus-ish source property so postcss won't make weird-looking
                // source-maps that break the visualizer
                //
                // https://github.com/postcss/postcss/releases/tag/5.1.0
                // https://github.com/postcss/postcss/pull/761
                // https://github.com/tivac/modular-css/pull/157
                //
                comment.source = result.root.source;
                comment.source.end = comment.source.start;

                root.append(comment);
                
                root.append(result.root);
            });
            
            return self._done.process(
                root,
                Object.assign(
                    Object.create(null),
                    self._options,
                    args || Object.create(null)
                )
            );
        })
        .then((result) => {
            self._warnings(result);

            result.compositions = output.compositions(self._options.cwd, self);
            
            return result;
        });
    },
    
    // Expose files
    get files() {
        return this._files;
    },
    
    // Process files and walk their composition/value dependency tree to find
    // new files we need to process
    _walk : function(name, text) {
        var self = this;
        
        // No need to re-process files
        if(self._files[name]) {
            return Promise.resolve();
        }
        
        self._graph.addNode(name);

        self._files[name] = {
            text    : text,
            exports : false,
            values  : false
        };
        
        return self._before.process(text, Object.assign(
            Object.create(null),
            self._options,
            {
                from  : name,
                graph : self._graph,
                files : self._files,

                // Run parsers in loose mode for this first pass
                strict : false
            }
        ))
        .then((result) => {
            self._files[name].result = result;

            // Check for plugin warnings
            self._warnings(result);
            
            // Walk this node's dependencies, reading new files from disk as necessary
            return Promise.all(
                self._graph.dependenciesOf(name).map((dependency) => self._walk(
                    dependency,
                    self._files[dependency] ?
                        null :
                        fs.readFileSync(dependency, "utf8")
                ))
            );
        });
    },

    _warnings : function(result) {
        var warnings;
        
        if(!this._options.strict) {
            return;
        }

        warnings = result.warnings();
        
        if(warnings.length) {
            throw new Error(warnings.map((warning) => warning.toString()).join("\n"));
        }
    }
};

module.exports = Processor;
