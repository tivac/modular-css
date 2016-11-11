"use strict";

var assert  = require("assert"),
    
    glob = require("../src/glob"),
    
    compare = require("./lib/compare-files");

describe("/glob.js", function() {
    it("should be a function", function() {
        assert.equal(typeof glob, "function");
    });

    it("should use a default search", function() {
        return glob({
            cwd : "./test/specimens/glob"
        })
        .then((processor) => processor.output())
        .then((output) => compare.stringToFile(output.css, "./test/results/glob/glob.css"));
    });

    it("should find files on disk & output css", function() {
        return glob({
            cwd    : "./test/specimens/glob",
            search : [
                "**/*.css"
            ]
        })
        .then((processor) => processor.output())
        .then((output) => compare.stringToFile(output.css, "./test/results/glob/glob.css"));
    });

    it("should support exclusion patterns", function() {
        return glob({
            cwd    : "./test/specimens/glob",
            search : [
                "**/*.css",
                "!**/exclude/**"
            ]
        })
        .then((processor) => processor.output())
        .then((output) => compare.stringToFile(output.css, "./test/results/glob/glob-excludes.css"));
    });
});
