"use strict";

const fs = require("fs");
const path = require("path");

const mkdirp = require("mkdirp");

const Processor = require("modular-css-core");
const methods = require("./methods.js");

module.exports = function(args) {
    const processor = new Processor(args);
    let source;

    return {
        preprocess : {
            markup : methods.markup(processor),
            style  : methods.style
        },

        plugin : {
            name : "modular-css-rollup-svelte",

            options : ({ input }) => {
                source = input;
            },

            ongenerate : (bundle, result) => {
                result.css = processor.output({
                    from : source,
                    to   : args.css
                });
            },

            onwrite : (bundle, result) =>
                result.css.then((data) => {
                    if(args.css) {
                        mkdirp.sync(path.dirname(args.css));
                        
                        fs.writeFileSync(
                            args.css,
                            data.css
                        );
                    }
                })
        }
    };
};
