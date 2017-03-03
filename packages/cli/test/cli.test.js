"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    tester = require("cli-tester/es5"),

    compare = require("test-utils/compare.js")(__dirname),
    
    cli = require.resolve("../cli.js");

function success(out) {
    expect(out.code).toBe(0);

    return out;
}

describe("/cli.js", function() {
    afterAll(() => require("shelljs").rm("-rf", "./packages/cli/test/output"));

    it("should show help with no args", function() {
        return tester(cli)
            .then(success)
            .then((out) => expect(out.stdout).toMatch("--help"));
    });

    it("should default to outputting to stdout", function() {
        return tester(cli, "./packages/cli/test/specimens/simple.css")
            .then(success)
            .then((out) => compare.stringToFile(out.stdout, "./packages/cli/test/results/simple.css"));
    });

    it("should support outputting to a file", function() {
        return tester(cli, "--out=./packages/cli/test/output/simple.css", "./packages/cli/test/specimens/simple.css")
            .then(success)
            .then((out) => compare.results("simple.css"));
    });

    it("should support outputting compositions to a file", function() {
        return tester(cli, "--json=./packages/cli/test/output/classes.json", "./packages/cli/test/specimens/simple.css")
            .then(success)
            .then((out) => compare.results("classes.json"));
    });

    it("should return the correct error code on invalid CSS", function() {
        return tester(cli, "./packages/cli/test/specimens/invalid.css")
            .then((out) => {
                expect(out.code).toBe(1);
                
                expect(out.stderr).toMatch("Invalid composes reference");
            });
    });
});
