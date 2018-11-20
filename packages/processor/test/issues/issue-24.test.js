"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/24", () => {
        it("should be able to compose using a value", () => {
            const processor = new Processor({
                    namer,
                });
            
            return processor.string(
                "./packages/processor/test/specimens/composition.css",
                dedent(`
                    @value simple: "./simple.css";
                    
                    .a {
                        composes: wooga from simple;
                        background: #000;
                    }
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
