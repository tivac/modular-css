const { describe, it, beforeEach } = require("node:test");

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
        
        it("should fail if not a valid composition reference", async (t) => {
            await t.assert.rejects(
                async () => processor.string(
                    "./invalid-external.css",
                    dedent(`
                        :external(some garbage here) { }
                    `)
                ),
                `SyntaxError: Expected`
            );
        });

        it("should fail on bad class references", async (t) => {
            const invalid = require.resolve("./specimens/externals-invalid.css");
            
            await t.assert.rejects(
                async () => processor.file(invalid),
                `Invalid external reference: nopenopenope`
            );
        });
        
        it("should support overriding external values", async (t) => {
            await processor.file(
                "./packages/processor/test/specimens/externals.css"
            );

            const { css } = await processor.output();
            
            t.assert.snapshot(css);
        });
    });
});
