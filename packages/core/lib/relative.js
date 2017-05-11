"use strict";

var path = require("path"),

    sepRegex    = /\\/g,
    prefixRegex = /^\.\.?\//;

// Get a relative version of an absolute path w/ cross-platform/URL-friendly
// directory separators
module.exports = function(cwd, file) {
    debugger;
    
    var absolute = path.isAbsolute(file) ? file : path.resolve(cwd, file);

    return path.relative(cwd, absolute).replace(sepRegex, "/");
};

module.exports.prefixed = function(cwd, file) {
    var out = module.exports(cwd, file);

    if(!prefixRegex.test(out)) {
        out = `./${out}`;
    }

    return out;
};
