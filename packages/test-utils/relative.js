"use strict";

var path = require("path"),

    sepRegex = /\\/g;

// Get a relative version of an absolute path w/ cross-platform/URL-friendly
// directory separators
module.exports = function(files) {
    var cwd = process.cwd();
    
    return files.map((file) =>
        path.relative(cwd, file).replace(sepRegex, "/")
    );
};
