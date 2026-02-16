const { describe, it } = require("node:test");

const tester = require("cli-tester");

const read = require("@modular-css/test-utils/read.js")(__dirname);

const cli = require.resolve("../cli.js");

describe("/cli.js", () => {
    require("shelljs").rm("-rf", "./packages/cli/test/output");

    it("should show help with no args", async (t) => {
        const out = await tester(
            cli
        );

        t.assert.strictEqual(out.code, 2);
        t.assert.snapshot(out.stdout);
    });

    it("should default to outputting to stdout", async (t) => {
        const out = await tester(
            cli,
            "./packages/cli/test/specimens/simple.css"
        );

        t.assert.strictEqual(out.code, 0);
        t.assert.snapshot(out.stdout);
    });

    it("should support outputting to a file (--out)", async (t) => {
        const out = await tester(
            cli,
            "--out=./packages/cli/test/output/simple.css",
            "./packages/cli/test/specimens/simple.css"
        );

        t.assert.strictEqual(out.code, 0);
        t.assert.snapshot(read("simple.css"));
    });

    it("should support outputting compositions to a file (--json)", async (t) => {
        const out = await tester(
            cli,
            "--json=./packages/cli/test/output/classes.json",
            "./packages/cli/test/specimens/simple.css"
        );

        t.assert.strictEqual(out.code, 0);
        t.assert.snapshot(read("classes.json"));
    });

    it("should return the correct error code on invalid CSS", async (t) => {
        const out = await tester(
            cli,
            "./packages/cli/test/specimens/invalid.css"
        );

        t.assert.strictEqual(out.code, 1);
        t.assert.match(out.stderr, /Invalid composes reference/);
    });

    it("should support disabling url() rewriting (--no-rewrite)", async (t) => {
        const out = await tester(
            cli,
            "--no-rewrite",
            "--out=./packages/cli/test/output/no-rewrite.css",
            "./packages/cli/test/specimens/no-rewrite.css"
        );

        t.assert.strictEqual(out.code, 0);
        t.assert.snapshot(read("no-rewrite.css"));
    });
});
