"use strict";

const path = require("path");

const sepRegex = /\\/g;

// Get a relative version of an absolute path w/ cross-platform/URL-friendly
// directory separators
module.exports = function(files) {
    var cwd = process.cwd();

    if(!Array.isArray(files)) {
        files = [ files ];
    }
    
    return files.map((file) =>
        path.relative(cwd, file).replace(sepRegex, "/")
    );
};
