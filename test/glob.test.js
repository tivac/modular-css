"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    glob = require("../src/glob"),
    
    compare = require("./lib/compare-files");

// Catch unhandled promise rejections and fail the test
process.on("unhandledRejection", function(reason) {
    throw reason;
});

describe.only("/glob.js", function() {
    it("should be a function", function() {
        assert.equal(typeof glob, "function");
    });

    it("should find files on disk & output css", function() {
        return glob({
            cwd    : "./test/specimens/glob",
            search : [
                "**/*.css"
            ]
        })
        .then(function(output) {
            compare.stringToFile(output.css, "./test/results/glob/glob.css");
        });
    });

    it("should support exclusion patterns", function() {
        return glob({
            cwd    : "./test/specimens/glob",
            search : [
                "**/*.css",
                "!**/exclude/**"
            ]
        })
        .then(function(output) {
            compare.stringToFile(output.css, "./test/results/glob/glob-excludes.css");
        });
    });
});


// var g = require("./src/glob");

// g({ patterns : [ "**/*.css", "!**/node_modules/**" ], cwd : "./test/specimens/glob" });
