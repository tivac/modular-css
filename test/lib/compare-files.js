"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert");

exports.paths = function paths(path1, path2) {
    assert.equal(
        fs.readFileSync(path1, "utf8") + "\n",
        fs.readFileSync(path2, "utf8"),
        "Expected " + path1 + " to be the same as " + path2
    );
};

exports.results = function results(name1, name2) {
    var path1 = path.join("./test/output", name1),
        path2 = path.join("./test/results", name2 || name1);

    return exports.paths(path1, path2);
};

exports.contains = function(haystack, name) {
    var needle = fs.readFileSync(path.join("./test/results", name), "utf8");
    
    assert(haystack.indexOf(needle) > -1, "Unable to find " + needle + " in " + haystack);
};
