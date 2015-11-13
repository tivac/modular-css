"use strict";

var fs   = require("fs"),

    assign   = require("lodash.assign"),
    Graph    = require("dependency-graph").DepGraph,
    postcss  = require("postcss"),

    parser = postcss([
        require("./plugins/values.js"),
        require("./plugins/scoping.js"),
        require("./plugins/composition.js"),
        require("./plugins/keyframes.js")
    ]),
    
    urls = postcss([
        require("postcss-url")
    ]),
    
    imports  = require("./_imports"),
    relative = require("./_relative");

function Processor(opts) {
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }

    this._opts  = opts;
    this._files = {};
    this._all   = new Graph();
}

Processor.prototype = {
    file : function(file) {
        return this.string(file, fs.readFileSync(file, "utf8"));
    },

    string : function(name, text) {
        var self  = this,
            start = relative(name);

        this._local = new Graph();

        this._addNode(start);
        this._walk(start, text);

        this._local.overallOrder().forEach(function(file) {
            var details = self._files[file],
                parsed  = parser.process(details.text, assign({}, self._opts, {
                    from  : file,
                    files : self._files
                }));
            
            details.parsed = parsed;
            
            parsed.messages.forEach(function(msg) {
                if(msg.values) {
                    details.values = msg.values;
                    
                    return;
                }
                
                if(msg.compositions) {
                    details.compositions = msg.compositions;
                    
                    return;
                }
            });
        });
        
        return {
            files   : this._files,
            exports : this._files[start].compositions
        };
    },

    dependencies : function(file) {
        return file ? this._all.dependenciesOf(file) : this._all.overallOrder();
    },

    css : function(args) {
        var self  = this,
            root  = postcss.root(),
            opts  = args || false,
            files = opts.files || this._all.overallOrder();
        
        files.forEach(function(dep) {
            var css;
            
            // Insert a comment w/ the file we're doing
            root.append(postcss.comment({ text : dep }));
            
            // Rewrite relative URLs before adding
            // Have to do this every time because target file might be different!
            css = urls.process(self._files[dep].parsed.root, {
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

    _addNode : function(name) {
        this._local.addNode(name);
        this._all.addNode(name);
    },

    _addDependency : function(from, to) {
        this._local.addDependency(from, to);
        this._all.addDependency(from, to);
    },

    _walk : function(name, text) {
        var self = this,
            css;

        function parse(field, rule) {
            var parsed = imports.parse(name, rule[field]);
            
            if(!parsed) {
                return;
            }
            
            this._addNode(parsed.source);
            this._addDependency(name, parsed.source);
        }
    
        // Avoid re-parsing
        if(!this._files[name]) {
            this._files[name] = {
                text : text
            };
            
            css = postcss.parse(text, { from : name });
            css.walkAtRules("value", parse.bind(this, "params"));
            css.walkDecls("composes", parse.bind(this, "value"));
        } else {
            // File already parsed so go figure out dep tree and copy it to the local graph
            this._all.dependenciesOf(name).forEach(function(dependency) {
                self._local.addNode(dependency);
                self._local.addDependency(name, dependency);
            });
        }
        
        this._local.dependenciesOf(name).forEach(function(dependency) {
            // Walk, but don't re-read files that've already been handled
            self._walk(
                dependency,
                self._files[dependency] ? null : fs.readFileSync(dependency, "utf8")
            );
        });
    }
};

module.exports = Processor;
