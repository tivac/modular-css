const { describe, it } = require("node:test");

const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/261", () => {
        it("should allow colons in rules that also use :external()", async (t) => {
            const processor = new Processor();
            
            await processor.file(require.resolve("./specimens/261/2.css"));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });
    });
});
