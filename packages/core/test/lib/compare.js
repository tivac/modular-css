"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert");

exports.paths = function(path1, path2) {
    assert.equal(
        fs.readFileSync(path1, "utf8").trim(),
        fs.readFileSync(path2, "utf8").trim(),
        `Expected ${path1} to be the same as ${path2}`
    );
};

exports.results = function(name1, name2) {
    var path1 = path.join("./test/output", name1),
        path2 = path.join("./test/results", name2 || name1);

    return exports.paths(path1, path2);
};

exports.stringToFile = function(str, file) {
    assert.equal(
        str.trim(),
        fs.readFileSync(file, "utf8").trim(),
        `Expected css to match ${file}`
    );
};

exports.contains = function(haystack, name) {
    var needle = fs.readFileSync(path.join("./test/results", name), "utf8");
    
    assert(
        haystack.indexOf(needle) > -1,
        `Unable to find ${needle} in ${haystack}`
    );
};
