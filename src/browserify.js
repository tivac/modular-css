"use strict";

var fs   = require("fs"),
    path = require("path"),

    through = require("through2"),
    assign  = require("lodash.assign"),
    
    processor = require("./processor");

module.exports = function(file, opts) {
    var options = assign({}, { extension : ".css" }, opts),
        buffer;
    
    if(path.extname(file) !== options.extension) {
        return through();
    }
    
    buffer = "";
    
    return through(
        function(chunk, enc, callback) {
            buffer += chunk.toString("utf8");
            callback();
        },
        
        function(callback) {
            var result = processor.string(file, buffer),
                dest   = options.dest || file.replace(options.extension, ".compiled" + options.extension);
            
            fs.writeFileSync(dest, result.css, "utf8");
            
            this.push("module.exports = " + JSON.stringify(result.exports) + ";");
            callback();
        }
    );
};
