"use strict";

var tester = require("cli-tester/es5"),

    read = require("test-utils/read.js")(__dirname),
    
    cli = require.resolve("../cli.js");

function success(out) {
    expect(out.code).toBe(0);
    
    return out;
}
    
describe("/cli.js", function() {
    afterAll(() => require("shelljs").rm("-rf", "./packages/cli/test/output"));

    it("should show help with no args", () =>
        tester(
            cli
        )
        .then(success)
        .then((out) => expect(out.stdout).toMatchSnapshot())
    );

    it("should default to outputting to stdout", () =>
        tester(
            cli,
            "./packages/cli/test/specimens/simple.css"
        )
        .then(success)
        .then((out) => expect(out.stdout).toMatchSnapshot())
    );

    it("should support outputting to a file", () =>
        tester(
            cli,
            "--out=./packages/cli/test/output/simple.css",
            "./packages/cli/test/specimens/simple.css"
        )
        .then(success)
        .then(() => expect(read("simple.css")).toMatchSnapshot())
    );

    it("should support outputting compositions to a file", () =>
        tester(
            cli,
            "--json=./packages/cli/test/output/classes.json",
            "./packages/cli/test/specimens/simple.css"
        )
        .then(success)
        .then(() => expect(read("classes.json")).toMatchSnapshot())
    );

    it("should return the correct error code on invalid CSS", () =>
        tester(
            cli,
            "./packages/cli/test/specimens/invalid.css"
        )
        .then((out) => {
            expect(out.code).toBe(1);
            expect(out.stderr).toMatch("Invalid composes reference");
        })
    );
});
