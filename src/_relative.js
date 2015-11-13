"use strict";

var path = require("path"),

    regex = /\\/g,
    cwd   = process.cwd();

module.exports = function(file) {
    return path.relative(cwd, file).replace(regex, "/");
};
