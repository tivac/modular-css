"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    tester = require("cli-tester/es5"),

    compare = require("test-utils/compare.js"),
    
    cli = require.resolve("../cli.js");

function success(out) {
    assert.equal(out.code, 0, out.stderr);

    return out;
}

describe("/bin/cli.js", function() {
    after(() => require("shelljs").rm("-rf", "./test/output/cli"));

    it("should show help with no args", function() {
        return tester(cli)
            .then(success)
            .then((out) => assert(out.stdout.indexOf("--help") > -1));
    });

    it("should default to outputting to stdout", function() {
        return tester(cli, "./test/specimens/simple.css")
            .then(success)
            .then((out) => compare.stringToFile(out.stdout, "./test/results/cli/simple.css"));
    });

    it("should support outputting to a file", function() {
        return tester(cli, "--out=./test/output/cli/simple.css", "./test/specimens/simple.css")
            .then(success)
            .then((out) => compare.results("cli/simple.css"));
    });

    it("should support outputting compositions to a file", function() {
        return tester(cli, "--json=./test/output/cli/classes.json", "./test/specimens/simple.css")
            .then(success)
            .then((out) => compare.results("cli/classes.json"));
    });

    it("should return the correct error code on invalid CSS", function() {
        return tester(cli, "./test/specimens/invalid.css")
            .then((out) => {
                assert.equal(out.code, 1);
                
                assert(out.stderr.indexOf("Invalid composes reference") > -1);
            });
    });
});
