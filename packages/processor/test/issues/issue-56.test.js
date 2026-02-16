const { describe, it } = require("node:test");

const dedent = require("dedent");

const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/56", () => {
        it("should prune rules that only compose, but leave them in the exports", async (t) => {
            const processor = new Processor({
                    namer,
                });
            
            const { exports } = await processor.string(
                "./packages/processor/test/specimens/issues/56.css",
                dedent(`
                    .booga { color: red }
                    .fooga { composes: booga }
                    .fooga:hover { color: blue }
                    .wooga { composes: booga }
                `)
            );

            t.assert.snapshot(exports);

            const { css } = await processor.output();
            
            t.assert.snapshot(css);
        });
    });
});
