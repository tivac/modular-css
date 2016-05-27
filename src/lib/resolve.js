"use strict";

var path = require("path"),

    find = require("resolve-from");

module.exports = function resolve(src, file) {
    var dir   = path.dirname(src),
        found = find(dir, file);

    if(!found) {
        throw new Error("Unable to locate \"" + file + "\" from \"" + dir + "\"");
    }
    
    return found;
};
