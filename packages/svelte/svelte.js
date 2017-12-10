"use strict";

const Processor = require("modular-css-core");
const methods = require("./methods.js");

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
