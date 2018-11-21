"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const glob = require("../glob.js");

describe("/glob.js", () => {
    it("should be a function", () => {
        expect(typeof glob).toBe("function");
    });

    it("should use a default search", async () => {
        const processor = await glob({
            namer,
            cwd : "./packages/glob/test/specimens",
        });
        
        const { css } = await processor.output();

        expect(css).toMatchSnapshot();
    });

    it("should find files on disk & output css", async () => {
        const processor = await glob({
            namer,
            cwd    : "./packages/glob/test/specimens",
            search : [
                "**/*.css",
            ],
        });
        
        const { css } = await processor.output();

        expect(css).toMatchSnapshot();
    });

    it("should support exclusion patterns", async () => {
        const processor = await glob({
            namer,
            cwd    : "./packages/glob/test/specimens",
            search : [
                "**/*.css",
                "!**/exclude/**",
            ],
        });
        
        const { css } = await processor.output();

        expect(css).toMatchSnapshot();
    });
});
