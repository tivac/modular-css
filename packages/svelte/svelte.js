"use strict";

const Processor = require("modular-css-core");
const methods = require("./methods.js");

// TODO: Remove rollup stuff, see README.md for example API
module.exports = function(args) {
    const processor = new Processor(args);

    return {
        processor,

        preprocess : {
            markup : methods.markup(processor),
            style  : methods.style
        }
    };
};
