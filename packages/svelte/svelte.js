"use strict";

const Processor = require("modular-css-core");

const markup = require("./src/markup.js");
const style = require("./src/style.js");

module.exports = function(args) {
    const config = Object.assign(
        Object.create(null),
        { strict : false },
        args
    );

    const processor = new Processor(config);

    return {
        processor,

        preprocess : {
            markup : markup(processor),
            style,
        },
    };
};
