"use strict";

var postcss = require("postcss"),
    
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

                return output;
            });
    }
);
