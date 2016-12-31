"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    postcss = require("postcss"),
    mkdirp  = require("mkdirp"),
    
    Processor = require("./processor.js");

module.exports = postcss.plugin("modular-css", () =>
    (root, result) => {
        var processor = new Processor(result.opts),
            classes;

        return processor.string(result.opts.from, root)
            .then((output) => {
                classes = output.exports;
                
                return processor.output();
            })
            .then((output) => {
                result.messages.push({
                    type    : "modular-css-exports",
                    exports : classes
                });
                
                if(result.opts.json) {
                    mkdirp.sync(path.dirname(result.opts.json));
                    fs.writeFileSync(
                        result.opts.json,
                        JSON.stringify(output.compositions, null, 4)
                    );
                }

                return output;
            });
    }
);
