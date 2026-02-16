const { describe, it } = require("node:test");

const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/66", () => {
        it("should ignore remove calls for unknown files", async (t) => {
            const processor = new Processor();

            await processor.string(
                "./packages/processor/test/specimens/a.css",
                ".aooga { }"
            );

            t.assert.doesNotThrow(() => processor.remove("./fooga.js"));
        });
    });
});
