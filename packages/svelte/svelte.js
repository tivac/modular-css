"use strict";

const Processor = require("modular-css-core");

const markup = require("./src/markup.js");
const style = require("./src/style.js");

module.exports = function(args) {
    const processor = new Processor(args);

    return {
        processor,

        preprocess : {
            markup : markup(processor),
            style,
        },
    };
};
