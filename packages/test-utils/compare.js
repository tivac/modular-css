"use strict";

var fs     = require("fs"),
    path   = require("path");

module.exports = (cwd) => {
    var out = {};

    out.paths = function(path1, path2) {
        expect(
            fs.readFileSync(path1, "utf8").trim()
        ).toBe(
            fs.readFileSync(path2, "utf8").trim()
        );
    };

    out.results = function(name1, name2) {
        var path1 = path.join(cwd, "./output", name1),
            path2 = path.join(cwd, "./results", name2 || name1);

        return out.paths(path1, path2);
    };

    out.stringToFile = function(str, file) {
        expect(
            str.trim()
        ).toBe(
            fs.readFileSync(file, "utf8").trim()
        );
    };

    out.contains = function(haystack, name) {
        var needle = fs.readFileSync(path.join(cwd, "./results", name), "utf8");
        
        expect(haystack.toString()).toMatch(needle);
    };

    return out;
};
