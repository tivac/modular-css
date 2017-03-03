"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    tester = require("cli-tester/es5"),

    compare = require("test-utils/compare.js")(__dirname),
    
    cli = require.resolve("../cli.js");

function success(out) {
    assert.equal(out.code, 0, out.stderr);

    return out;
}

describe("/cli.js", function() {
    afterAll(() => require("shelljs").rm("-rf", "./packages/cli/test/output/cli"));

    it("should show help with no args", function() {
        return tester(cli)
            .then(success)
            .then((out) => assert(out.stdout.indexOf("--help") > -1));
    });

    it("should default to outputting to stdout", function() {
        return tester(cli, "./packages/cli/test/specimens/simple.css")
            .then(success)
            .then((out) => compare.stringToFile(out.stdout, "./packages/cli/test/results/cli/simple.css"));
    });

    it("should support outputting to a file", function() {
        return tester(cli, "--out=./packages/cli/test/output/cli/simple.css", "./packages/cli/test/specimens/simple.css")
            .then(success)
            .then((out) => compare.results("cli/simple.css"));
    });

    it("should support outputting compositions to a file", function() {
        return tester(cli, "--json=./packages/cli/test/output/cli/classes.json", "./packages/cli/test/specimens/simple.css")
            .then(success)
            .then((out) => compare.results("cli/classes.json"));
    });

    it("should return the correct error code on invalid CSS", function() {
        return tester(cli, "./packages/cli/test/specimens/invalid.css")
            .then((out) => {
                assert.equal(out.code, 1);
                
                assert(out.stderr.indexOf("Invalid composes reference") > -1);
            });
    });
});
