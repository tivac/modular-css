"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/56", () => {
        it("should prune rules that only compose, but leave them in the exports", async () => {
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

            expect(exports).toMatchSnapshot();

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
        });
    });
});
