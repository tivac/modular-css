"use strict";

const tester = require("cli-tester");

const read = require("test-utils/read.js")(__dirname);

const cli = require.resolve("../cli.js");

describe("/cli.js", () => {
    afterAll(() => require("shelljs").rm("-rf", "./packages/cli/test/output"));

    it("should show help with no args", async () => {
        const out = await tester(
            cli
        );

        expect(out.code).toBe(2);
        expect(out.stdout).toMatchSnapshot();
    });

    it("should default to outputting to stdout", async () => {
        const out = await tester(
            cli,
            "./packages/cli/test/specimens/simple.css"
        );

        expect(out.code).toBe(0);
        expect(out.stdout).toMatchSnapshot();
    });

    it("should support outputting to a file (--out)", async () => {
        const out = await tester(
            cli,
            "--out=./packages/cli/test/output/simple.css",
            "./packages/cli/test/specimens/simple.css"
        );

        expect(out.code).toBe(0);
        expect(read("simple.css")).toMatchSnapshot();
    });

    it("should support outputting compositions to a file (--json)", async () => {
        const out = await tester(
            cli,
            "--json=./packages/cli/test/output/classes.json",
            "./packages/cli/test/specimens/simple.css"
        );

        expect(out.code).toBe(0);
        expect(read("classes.json")).toMatchSnapshot();
    });

    it("should return the correct error code on invalid CSS", async () => {
        const out = await tester(
            cli,
            "./packages/cli/test/specimens/invalid.css"
        );

        expect(out.code).toBe(1);
        expect(out.stderr).toMatch("Invalid composes reference");
    });

    it("should support disabling url() rewriting (--no-rewrite)", async () => {
        const out = await tester(
            cli,
            "--no-rewrite",
            "--out=./packages/cli/test/output/no-rewrite.css",
            "./packages/cli/test/specimens/no-rewrite.css"
        );

        expect(out.code).toBe(0);
        expect(read("no-rewrite.css")).toMatchSnapshot();
    });
});
