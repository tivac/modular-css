"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/98", () => {
        it("should prune rules that only compose, but leave them in the exports", () => {
            const processor = new Processor({
                    namer,
                });
            
            return processor.string(
                "./packages/processor/test/specimens/issues/98.css",
                dedent(`
                    .booga { color: red }
                    .fooga { composes: booga }
                    .fooga + .fooga { color: blue }
                `)
            )
            .then(({ exports }) => {
                expect(exports).toMatchSnapshot();

                return processor.output();
            })
            .then(({ css }) => expect(css).toMatchSnapshot());
        });
    });
});
