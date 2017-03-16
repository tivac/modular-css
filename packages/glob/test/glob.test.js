"use strict";

var assert  = require("assert"),
    
    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),

    glob = require("../glob.js");

describe("/glob.js", function() {
    it("should be a function", function() {
        assert.equal(typeof glob, "function");
    });

    it("should use a default search", function() {
        return glob({
            namer,
            cwd : "./packages/glob/test/specimens"
        })
        .then((processor) => processor.output())
        .then((output) => compare.stringToFile(output.css, "./packages/glob/test/results/glob.css"));
    });

    it("should find files on disk & output css", function() {
        return glob({
            namer,
            cwd    : "./packages/glob/test/specimens",
            search : [
                "**/*.css"
            ]
        })
        .then((processor) => processor.output())
        .then((output) => compare.stringToFile(output.css, "./packages/glob/test/results/glob.css"));
    });

    it("should support exclusion patterns", function() {
        return glob({
            namer,
            cwd    : "./packages/glob/test/specimens",
            search : [
                "**/*.css",
                "!**/exclude/**"
            ]
        })
        .then((processor) => processor.output())
        .then((output) => compare.stringToFile(output.css, "./packages/glob/test/results/glob-excludes.css"));
    });
});
