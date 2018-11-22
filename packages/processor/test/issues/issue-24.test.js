"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/24", () => {
        it("should be able to compose using a value", async () => {
            const processor = new Processor({
                namer,
            });
            
            const { exports } = await processor.string(
                "./packages/processor/test/specimens/composition.css",
                dedent(`
                    @value simple: "./simple.css";
                    
                    .a {
                        composes: wooga from simple;
                        background: #000;
                    }
                `)
            );

            expect(exports).toMatchSnapshot();

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
        });
    });
});
