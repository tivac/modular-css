const { describe, it, beforeEach } = require("node:test");

const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("unicode", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should support unicode classes & ids", async (t) => {
            await processor.file(require.resolve("./specimens/unicode.css"));

            const { css } = await processor.output({
                to : "./packages/processor/test/output/unicode.css",
            });

            t.assert.snapshot(css);
        });
    });
});
