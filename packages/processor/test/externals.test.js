"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("externals", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });
        
        it("should fail if not a valid composition reference", async () => {
            await expect(processor.string(
                "./invalid-external.css",
                dedent(`
                    :external(some garbage here) { }
                `)
            )).rejects.toThrow(`SyntaxError: Expected`);
        });

        it("should fail on bad class references", async () => {
            await expect(processor.file(require.resolve("./specimens/externals-invalid.css"))).rejects.toThrow(
                `Invalid external reference: nopenopenope`
            );
        });
        
        it("should support overriding external values", async () => {
            await processor.file(
                "./packages/processor/test/specimens/externals.css"
            );

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
        });
    });
});
