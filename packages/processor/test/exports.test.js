"use strict";

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
        
        it("should export an object of arrays containing strings", async () => {
            const { exports } = await processor.string(
                "./simple.css",
                dedent(`
                    .red { color: red; }
                    .black { background: #000; }
                    .one, .two { composes: red, black; }
                `)
            );

            expect(exports).toMatchSnapshot();
        });

        it("should export identifiers and their classes", async () => {
            await processor.file(
                "./packages/processor/test/specimens/start.css"
            );

            const { compositions } = await processor.output();
            
            expect(compositions).toMatchSnapshot();
        });

        it("should include :global values by default", async () => {
            const { exports } = await processor.string(
                "./simple.css",
                dedent(`
                    :global(.a) { }
                `)
            );

            expect(exports).toMatchSnapshot();
        });

        it("should not include :global values when exportGlobals : false", async () => {
            processor = new Processor({
                namer,
                exportGlobals : false,
            });
            
            const { exports } = await processor.string(
                "./simple.css",
                dedent(`
                    :global(.a) { }
                `)
            );

            expect(exports).toMatchSnapshot();
        });
    });
});
