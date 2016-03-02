"use strict";

var fs   = require("fs"),
    path = require("path"),

    assign  = require("lodash.assign"),
    postcss = require("postcss"),
    mkdirp  = require("mkdirp"),
    
    scoping   = require("./plugins/scoping"),
    Processor = require("./processor");

module.exports = function(opts) {
    var options = assign({
            ext : ".css",
            map : process.env.NODE_ENV === "development"
        }, opts),
        
        processor = new Processor(options),
        scoper    = postcss([ scoping ]);
    
    options.namer = processor._namer.bind(processor);
    
    if(options.css) {
        mkdirp.sync(path.dirname(options.css));
    }
    
    require.extensions[options.ext] = function(m, filename) {
        var contents = fs.readFileSync(filename, "utf8"),
            msg;
        
        // Run scoping plugin, then find its output message which contains
        // the classes we're looking for
        scoper.process(contents, assign({}, options, { from : filename })).messages.some(function(item) {
            if(item.type === "modularcss" && item.plugin === "postcss-modular-css-scoping") {
                msg = item;
            }
            
            return msg;
        });
        
        // If an output file was specified we should also be running the full
        // processor instance against each file
        if(options.css) {
            processor.string(filename, contents).then(function() {
                return processor.output({
                    to : options.css
                });
            })
            .then(function(result) {
                fs.writeFileSync(options.css, result.css);
            })
            .catch(function(err) {
                throw new Error(err);
            });
        }
        
        return m._compile("module.exports = " + JSON.stringify(msg.classes, null, 4) + ";", filename);
    };
    
    options.remove = function() {
        delete require.extensions[options.ext];
    };
    
    return options;
};
