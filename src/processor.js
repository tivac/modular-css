"use strict";

var fs   = require("fs"),
    path = require("path"),

    postcss = require("postcss"),

    plugin = require("./plugin.js"),
    
    output   = require("./lib/output.js"),
    relative = require("./lib/relative.js");

function Processor(opts) {
    /* eslint consistent-return:0 */
    var options;
    
    if(!(this instanceof Processor)) {
        return new Processor(opts);
    }
    
    options = Object.assign(
        Object.create(null),
        {
            cwd    : process.cwd(),
            map    : false,
            strict : true,

            // Need to ensure that postcss-url isn't automatically
            // run in the after because processors support multiple output
            // locations
            after  : []
        },
        opts || {}
    );

    this._done = postcss(
        Array.isArray(options.done) ? options.done : [ options.done ]
    );
}

Processor.prototype = {
    // Add a file on disk to the dependency graph
    file : function(file) {
        return this.string(file, fs.readFileSync(file, "utf8"));
    },
    
    // Add a file by name + contents to the dependency graph
    string : function(name, text) {
        var options = this._options,
            start   = path.resolve(name);
        
        return plugin.process(text, options).then((result) => {
            options.graph = result.opts.graph;
            options.files = result.opts.files;

            this._css = result.css;

            return {
                id      : start,
                file    : start,
                files   : options.files,
                exports : result.messages.find((msg) => (msg.name === "modular-css-exports")).exports
            };
        });
    },
    
    // Remove a file from the dependency graph
    remove : function(input, args) {
        var options = this._options,
            files   = input;

        if(!Array.isArray(files)) {
            files = [ files ];
        }
        
        if(!args) {
            args = false;
        }

        files
            .filter((key) => options.graph.hasNode(key))
            .forEach((key) => {
                if(!args.shallow) {
                    // Remove everything that depends on this too, it'll all need
                    // to be recalculated
                    this.remove(options.graph.dependantsOf(key));
                }

                delete options.files[key];
                
                options.graph.removeNode(key);
            });
    },
    
    // Get the dependency order for a file or the entire tree
    dependencies : function(file) {
        var graph = this._options.graph;
        
        return file ?
            graph.dependenciesOf(path.normalize(file)) :
            graph.overallOrder();
    },
    
    // Get the ultimate output for specific files or the entire tree
    output : function(args) {
        var self  = this,
            opts  = args || false,
            files = opts.files;
        
        if(!Array.isArray(files)) {
            files = tiered(this._graph, {
                sort    : true,
                flatten : true
            });
        }
        
        return self._done.process(
                root,
                Object.assign(
                    Object.create(null),
                    self._options,
                    args || Object.create(null),
                    {
                        graph : self._graph,
                        files : self._files
                    }
                )
            );
        })
        .then((result) => {
            self._warnings(result);

            result.compositions = output.compositions(self._options.cwd, self._files);
            
            return result;
        });
    },
    
    // Expose files
    get files() {
        return this._files;
    }
};

module.exports = Processor;
