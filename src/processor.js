"use strict";

var fs   = require("fs"),

    assign   = require("lodash.assign"),
    map      = require("lodash.mapvalues"),
    Graph    = require("dependency-graph").DepGraph,
    postcss  = require("postcss"),

    preprocess = postcss([
        require("./plugins/values-local"),
        require("./plugins/graph-nodes")
    ]),

    postprocess = postcss([
        require("./plugins/values-composed.js"),
        require("./plugins/scoping.js"),
        require("./plugins/composition.js"),
        require("./plugins/keyframes.js")
    ]),

    urls = postcss([
        require("postcss-url")
    ]),

    relative = require("./_relative");

function Processor(opts) {
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }

    this._opts  = opts;
    this._files = {};
    this._graph = new Graph();
}

Processor.prototype = {
    file : function(file) {
        return this.string(file, fs.readFileSync(file, "utf8"));
    },

    string : function(name, text) {
        var self  = this,
            start = relative(name);

        this._walk(start, text);
        
        this._graph.dependenciesOf(start).concat(start).forEach(function(file) {
            var details = self._files[file],
                parsed;
                
            if(details.complete) {
                return;
            }
                
            parsed = postprocess.process(details.parsed, assign({}, self._opts, {
                from  : file,
                files : self._files
            }));
            
            // Combine messages from both postcss passes before pulling out relevant info
            details.parsed.messages.concat(parsed.messages).forEach(function(msg) {
                if(msg.values) {
                    details.values = assign(details.values || {}, msg.values);
                    
                    return;
                }
                
                if(msg.compositions) {
                    details.compositions = assign(details.compositions || {}, msg.compositions);
                    
                    return;
                }
            });
            
            details.complete = true;
            details.parsed = parsed;
        });
        
        return {
            files   : this._files,
            exports : map(this._files[start].compositions, function(exports) {
                return exports.join(" ");
            })
        };
    },

    remove : function(input) {
        var self  = this,
            files = input;

        if(!Array.isArray(files)) {
            files = [ files ];
        }

        files.forEach(function(file) {
            var key = relative(file);

            delete self._files[key];
            
            self._graph.removeNode(key);
        });
    },

    dependencies : function(file) {
        return file ? this._graph.dependenciesOf(file) : this._graph.overallOrder();
    },

    css : function(args) {
        var self  = this,
            root  = postcss.root(),
            opts  = args || false,
            files = opts.files || this._graph.overallOrder();
        
        files.forEach(function(dep) {
            var css;
            
            // Insert a comment w/ the file we're doing
            root.append(postcss.comment({ text : dep }));
            
            // Rewrite relative URLs before adding
            // Have to do this every time because target file might be different!
            // NOTE: the call to .clone() is really important here, otherwise this call
            // modifies the .parsed root itself and you can process URLs multiple times
            // See https://github.com/tivac/modular-css/issues/35
            css = urls.process(self._files[dep].parsed.root.clone(), {
                from : dep,
                to   : opts.to
            });
            
            root.append(css.root);
        });

        return root.toResult().css;
    },

    get files() {
        return this._files;
    },

    _walk : function(name, text) {
        var self = this,
            parsed;

        this._graph.addNode(name);

        // Avoid re-processing files we've already seen
        if(!(name in this._files)) {
            parsed = preprocess.process(text, { from : name, graph : this._graph });
            
            // This is super-weird, but we need to trigger processing
            // so that the graph is updated
            /* eslint no-unused-expressions:0 */
            parsed.css;

            this._files[name] = {
                parsed : parsed,
                text   : text
            };
        }
        
        // Walk this node's dependencies, reading new files from disk as necessary
        this._graph.dependenciesOf(name).forEach(function(dependency) {
            self._walk(
                dependency,
                self._files[dependency] ? null : fs.readFileSync(dependency, "utf8")
            );
        });
    }
};

module.exports = Processor;
