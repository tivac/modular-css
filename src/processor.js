"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    assign   = require("lodash.assign"),
    defaults = require("lodash.defaults"),
    Graph    = require("dependency-graph").DepGraph,
    postcss  = require("postcss"),
    urls     = require("postcss-url"),
    slug     = require("unique-slug"),

    Promise    = require("./lib/promise"),
    output     = require("./lib/output"),
    message    = require("./lib/message"),
    relative   = require("./lib/relative"),
    cloneGraph = require("./lib/clone-graph"),
    sequential = require("./lib/sequential");

function Processor(opts) {
    /* eslint consistent-return:0 */
    var options = opts;
    
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }
    
    this._options = defaults({}, options || {}, {
        cwd   : process.cwd(),
        map   : false,
        namer : this._namer.bind(this)
    });
    
    this._files = {};
    this._graph = new Graph();
    
    this._before = postcss((this._options.before || []).concat(
        require("./plugins/values-local"),
        require("./plugins/graph-nodes")
    ));

    this._process = postcss([
        require("./plugins/values-composed.js"),
        require("./plugins/scoping.js"),
        require("./plugins/composition.js"),
        require("./plugins/keyframes.js")
    ]);
    
    this._after = postcss(this._options.after || [
        urls
    ]);
    
    this._done = postcss(this._options.done || []);
}

Processor.prototype = {
    // Add a file on disk to the dependency graph
    file : function(file) {
        return this.string(file, fs.readFileSync(file, "utf8"));
    },
    
    // Add a file by file + contents to the dependency graph
    string : function(file, text) {
        var self  = this,
            start = path.resolve(file);
        
        return this._walk(start, text).then(function() {
            var deps = self._graph.dependenciesOf(start).concat(start);
            
            return sequential(deps.map(function(dep) {
                return function() {
                    var details = self._files[dep];
                    
                    if(!details.processed) {
                        details.processed = self._process.process(
                            details.result,
                            assign({}, self._options, {
                                from  : dep,
                                files : self._files,
                                namer : self._options.namer
                            })
                        );
                    }
                    
                    return details.processed.then(function(result) {
                        details.exports = message(result, "classes");
                        details.result  = result;
                    });
                };
            }));
        })
        .then(function() {
            return {
                id      : start,
                file    : start,
                files   : self._files,
                exports : self._files[start].exports
            };
        });
    },
    
    // Remove a file from the dependency graph
    remove : function(input) {
        var self  = this,
            files = input;

        if(!Array.isArray(files)) {
            files = [ files ];
        }

        files.filter(function(key) {
            return self._graph.hasNode(key);
        })
        .forEach(function(key) {
            // Remove everything that depends on this too, it'll all need
            // to be recalculated
            self.remove(self._graph.dependantsOf(key));
            
            delete self._files[key];
            
            self._graph.removeNode(key);
        });
    },
    
    // Get the dependency order for a file or the entire tree
    dependencies : function(file) {
        return file ? this._graph.dependenciesOf(file) : this._graph.overallOrder();
    },
    
    // Get the ultimate output for specific files or the entire tree
    output : function(args) {
        var self  = this,
            opts  = args || false,
            files = opts.files,
            clone = cloneGraph(this._graph),
            tier;
        
        if(!files) {
            files = [];
            
            while(Object.keys(clone.nodes).length) {
                tier = clone.overallOrder(true);
                
                tier.forEach(function(node) {
                    clone.dependantsOf(node).forEach(function(dep) {
                        clone.removeDependency(dep, node);
                    });
                    
                    clone.removeNode(node);
                });
                
                files = files.concat(tier.sort());
            }
        }
        
        return Promise.all(files.map(function(dep) {
            // Rewrite relative URLs before adding
            // Have to do this every time because target file might be different!
            return self._after.process(
                
                // NOTE: the call to .clone() is really important here, otherwise this call
                // modifies the .result root itself and you process URLs multiple times
                // See https://github.com/tivac/modular-css/issues/35
                self._files[dep].result.root.clone(),
                assign({}, self._options, {
                    from : dep,
                    to   : opts.to
                })
            );
        }))
        .then(function(results) {
            var root = postcss.root();

            results.forEach(function(result) {
                root.append(postcss.comment({
                    text : relative(self._options.cwd, result.opts.from)
                }));
                
                root.append(result.root);
            });
            
            return self._done.process(
                root,
                assign({}, self._options, args || {})
            );
        })
        .then(function(results) {
            results.compositions = output.compositions(self._options.cwd, self);
            
            return results;
        });
    },
    
    // Expose our file list
    get files() {
        return this._files;
    },
    
    // Process files and walk their composition/value dependency tree to find
    // new files we need to process
    _walk : function(name, text) {
        var self = this;
        
        self._graph.addNode(name);
        
        if(!self._files[name]) {
            self._files[name] = {
                text    : text,
                exports : {},
                values  : {},
                before  : self._before.process(text, assign({}, self._options, {
                    from  : name,
                    graph : self._graph,
                    files : self._files
                }))
            };
        }
        
        return self._files[name].before.then(function(result) {
            self._files[name].result = result;
            
            // Walk this node's dependencies, reading new files from disk as necessary
            return Promise.all(
                self._graph.dependenciesOf(name).map(function(dependency) {
                    return self._walk(
                        dependency,
                        self._files[dependency] ?
                            null :
                            fs.readFileSync(dependency, "utf8")
                    );
                })
            );
        });
    },
    
    _namer : function(file, selector) {
        return "mc" + slug(relative(this._options.cwd, file)) + "_" + selector;
    }
};

module.exports = Processor;
