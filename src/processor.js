"use strict";

var fs   = require("fs"),
    
    assign   = require("lodash.assign"),
    map      = require("lodash.mapvalues"),
    Graph    = require("dependency-graph").DepGraph,
    postcss  = require("postcss"),

    Promise  = require("./_promise"),
    relative = require("./_relative"),
    
    urls = postcss([
        require("postcss-url")
    ]);

function sequential(promises) {
    return new Promise(function(resolve, reject) {
        promises.reduce(function(curr, next) {
            return curr.then(next);
        }, Promise.resolve()).then(resolve, reject);
    });
}

function Processor(opts) {
    var options = opts;
    
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }
    
    if(!options) {
        options = false;
    }

    this._options = options;
    this._files   = {};
    this._graph   = new Graph();
    
    this._before = postcss((options.before || []).concat(
        require("./plugins/values-local"),
        require("./plugins/graph-nodes")
    ));

    this._process = postcss([
        require("./plugins/values-composed.js"),
        require("./plugins/scoping.js"),
        require("./plugins/composition.js"),
        require("./plugins/keyframes.js")
    ]);
    
    this._after = postcss(options.after || []);
}

Processor.prototype = {
    file : function(file) {
        return this.string(file, fs.readFileSync(file, "utf8"));
    },

    string : function(name, text) {
        var self  = this,
            start = relative(name);

        return this._walk(start, text).then(function() {
            return sequential(self._graph.dependenciesOf(start).concat(start).map(function(file) {
                return function() {
                    var details = self._files[file];
                    
                    if(!details.processed) {
                        details.processed = self._process.process(details.result, assign({}, self._options, {
                            from  : file,
                            files : self._files
                        }));
                    }
                    
                    return details.processed.then(function(result) {
                        details.result = result;
                        
                        // Combine messages from both postcss passes before pulling out relevant info
                        details.before.messages.concat(result.messages).forEach(function(msg) {
                            if(msg.values) {
                                details.values = assign(details.values || {}, msg.values);
                                
                                return;
                            }
                            
                            if(msg.compositions) {
                                details.compositions = assign(details.compositions || {}, msg.compositions);
                                
                                return;
                            }
                        });
                    });
                };
            }));
        })
        .then(function() {
            return {
                id      : start,
                file    : name,
                files   : self._files,
                exports : map(self._files[start].compositions, function(exports) {
                    return exports.join(" ");
                })
            };
        });
    },

    remove : function(input) {
        var self  = this,
            files = input;

        if(!Array.isArray(files)) {
            files = [ files ];
        }

        files.filter(function(file) {
            var key = relative(file);
            
            return self._graph.hasNode(key);
        })
        .forEach(function(file) {
            var key = relative(file);
            
            // Remove everything that depends on this too, it'll all need
            // to be recalculated
            self.remove(self._graph.dependantsOf(key));
            
            delete self._files[key];
            
            self._graph.removeNode(key);
        });
    },

    dependencies : function(file) {
        return file ? this._graph.dependenciesOf(file) : this._graph.overallOrder();
    },

    output : function(args) {
        var self  = this,
            root  = postcss.root(),
            opts  = args || false,
            files = opts.files || this.dependencies();
        
        files.forEach(function(dep) {
            var css;
            
            // Insert a comment w/ the file we're doing
            root.append(postcss.comment({ text : dep }));
            
            // Rewrite relative URLs before adding
            // Have to do this every time because target file might be different!
            // NOTE: the call to .clone() is really important here, otherwise this call
            // modifies the .result root itself and you process URLs multiple times
            // See https://github.com/tivac/modular-css/issues/35
            css = urls.process(self._files[dep].result.root.clone(), {
                from : dep,
                to   : opts.to
            });
            
            root.append(css.root);
        });
        
        return this._after.process(root, args || {});
    },

    get files() {
        return this._files;
    },

    _walk : function(name, text) {
        var self = this;
        
        self._graph.addNode(name);
        
        if(!self._files[name]) {
            self._files[name] = {
                text   : text,
                before : self._before.process(text, assign({}, self._options, {
                    from  : name,
                    graph : self._graph
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
    }
};

module.exports = Processor;
