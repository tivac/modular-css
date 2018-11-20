"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/56", () => {
        it("should prune rules that only compose, but leave them in the exports", () => {
            const processor = new Processor({
                    namer,
                });
            
            return processor.string(
                    "./packages/processor/test/specimens/issues/56.css",
                    dedent(`
                        .booga { color: red }
                        .fooga { composes: booga }
                        .fooga:hover { color: blue }
                        .wooga { composes: booga }
                    `)
            )
            .then((result) => {
                expect(result.exports).toMatchSnapshot();

                return processor.output();
            })
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
