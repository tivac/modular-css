const { describe, it } = require("node:test");

const namer = require("@modular-css/test-utils/namer.js");
const glob = require("../glob.js");

describe("/glob.js", () => {
    it("should be a function", (t) => {
        t.assert.strictEqual(typeof glob, "function");
    });

    it("should use a default search", async (t) => {
        const processor = await glob({
            namer,
            cwd : "./packages/glob/test/specimens",
        });
        
        const { css } = await processor.output();

        t.assert.snapshot(css);
    });

    it("should find files on disk & output css", async (t) => {
        const processor = await glob({
            namer,
            cwd    : "./packages/glob/test/specimens",
            search : [
                "**/*.css",
            ],
        });
        
        const { css } = await processor.output();

        t.assert.snapshot(css);
    });

    it("should support exclusion patterns", async (t) => {
        const processor = await glob({
            namer,
            cwd    : "./packages/glob/test/specimens",
            search : [
                "**/*.css",
                "!**/exclude/**",
            ],
        });
        
        const { css } = await processor.output();

        t.assert.snapshot(css);
    });
});
