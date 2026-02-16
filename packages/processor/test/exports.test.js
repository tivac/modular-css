const { describe, it, beforeEach } = require("node:test");

const dedent = require("dedent");

const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("exports", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });
        
        it("should export an object of arrays containing strings", async (t) => {
            const { exports } = await processor.string(
                "./simple.css",
                dedent(`
                    .red { color: red; }
                    .black { background: #000; }
                    .one, .two { composes: red, black; }
                `)
            );

            t.assert.snapshot(exports);
        });

        it("should export identifiers and their classes", async (t) => {
            await processor.file(
                "./packages/processor/test/specimens/start.css"
            );

            const { compositions } = await processor.output();
            
            t.assert.snapshot(compositions);
        });
    });
});
