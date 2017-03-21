"use strict";

var namer = require("test-utils/namer.js"),

    glob = require("../glob.js");

describe("/glob.js", function() {
    it("should be a function", function() {
        expect(typeof glob).toBe("function");
    });

    it("should use a default search", function() {
        return glob({
            namer,
            cwd : "./packages/glob/test/specimens"
        })
        .then((processor) => processor.output())
        .then((output) => expect(output.css).toMatchSnapshot());
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
        .then((output) => expect(output.css).toMatchSnapshot());
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
        .then((output) => expect(output.css).toMatchSnapshot());
    });
});
