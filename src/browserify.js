"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    assign  = require("lodash.assign"),
    map     = require("lodash.mapvalues"),
    
    Processor = require("./processor");

module.exports = function(browserify, opts) {
    var options = assign({
            ext  : ".css",
            css  : false,
            json : false
        }, opts),
        
        processor = new Processor();

    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", "Missing or invalid \"ext\" option: " + options.ext);
    }

    browserify.transform(function(file) {
        var buffer;

        if(path.extname(file) !== options.ext) {
            return through();
        }
        
        buffer = "";
        
        return through(
            function(chunk, enc, callback) {
                buffer += chunk.toString("utf8");
                callback();
            },
            
            function(callback) {
                var result = processor.string(file, buffer);
                
                this.push("module.exports = " + JSON.stringify(result.exports) + ";");
                
                callback();
            }
        );
    }, { global : true });

    browserify.on("bundle", function(bundle) {
        bundle.on("end", function() {
            if(options.css) {
                fs.writeFileSync(options.css, processor.css);
            }

            if(options.json) {
                fs.writeFileSync(options.json, JSON.stringify(map(processor.files, function(file) {
                    return file.compositions;
                })));
            }
        });
    });
};
