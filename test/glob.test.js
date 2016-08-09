"use strict";

var assert  = require("assert"),
    
    glob = require("../src/glob"),
    
    compare = require("./lib/compare-files");

describe("/glob.js", function() {
    it("should be a function", function() {
        assert.equal(typeof glob, "function");
    });

    it("should find files on disk & output css", function() {
        return glob({
            dir    : "./test/specimens/glob",
            search : [
                "**/*.css"
            ]
        })
        .then(function(processor) {
            return processor.output();
        })
        .then(function(output) {
            compare.stringToFile(output.css, "./test/results/glob/glob.css");
        });
    });

    it("should support exclusion patterns", function() {
        return glob({
            dir    : "./test/specimens/glob",
            search : [
                "**/*.css",
                "!**/exclude/**"
            ]
        })
        .then(function(processor) {
            return processor.output();
        })
        .then(function(output) {
            compare.stringToFile(output.css, "./test/results/glob/glob-excludes.css");
        });
    });
});
