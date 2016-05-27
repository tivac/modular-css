"use strict";

var path = require("path"),

    regex = /\\/g;

// Get a relative version of an absolute path w/ cross-platform/URL-friendly
// directory separators
module.exports = function(cwd, file) {
    return path.relative(cwd, file).replace(regex, "/");
};
