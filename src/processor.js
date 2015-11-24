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
    
    composition = require("./_composition"),
    relative    = require("./_relative");

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

    _walk : function(name, text) {
        var self = this,
            css;

        this._graph.addNode(name);

        // Avoid re-parsing
        if(!this._files[name]) {
            this._files[name] = {
                text : text
            };
            
            css = postcss.parse(text, { from : name });
            css.walkAtRules("value", this._parse.bind(this, name, "params"));
            css.walkDecls("composes", this._parse.bind(this, name, "value"));
        }
        
        this._graph.dependenciesOf(name).forEach(function(dependency) {
            // Walk, but don't re-read files that've already been handled
            self._walk(
                dependency,
                self._files[dependency] ? null : fs.readFileSync(dependency, "utf8")
            );
        });
    },

    _parse : function(origin, field, rule) {
        var parsed = composition(origin, rule[field]);
        
        if(!parsed || !parsed.source) {
            return;
        }

        this._graph.addNode(parsed.source);
        this._graph.addDependency(origin, parsed.source);
    }
};

module.exports = Processor;
