"use strict";

var Processor = require("./processor"),
    output    = require("./lib/output");

// https://webpack.github.io/docs/loaders.html
module.exports = function(source, map) {
    var done = this.async();

    console.log(this.resourcePath);

    done(null, source);
};
