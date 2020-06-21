"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("scoping", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should scope classes, ids, and keyframes", async () => {
            const { exports } = await processor.string(
                "./simple.css",
                dedent(`
                    @keyframes kooga { }
                    #fooga { }
                    .wooga { }
                    .one,
                    .two { }
                `)
            );
            

            expect(exports).toMatchSnapshot();

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
        });

        it("should handle pseudo classes correctly", async () => {
            const { exports } = await processor.string(
                "./simple.css",
                dedent(`
                    :global(.g1) {}
                    .b :global(.g2) {}
                    :global(#c) {}
                    .d:hover {}
                    .e:not(.e) {}
                `)
            );

            expect(exports).toMatchSnapshot();

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
        });

        it("should not allow :global classes to overlap with local ones (local before global)", async () => {
            await expect(processor.string(
                "./invalid/global.css",
                dedent(`
                    .a {}
                    :global(.a) {}
                `)
            )).rejects.toThrow(`Unable to re-use the same selector for global & local`);
        });

        it("should not allow :global classes to overlap with local ones (global before local)", async () => {
            await expect(processor.string(
                "./invalid/global.css",
                dedent(`
                    :global(.a) {}
                    .a {}
                `)
            )).rejects.toThrow(`Unable to re-use the same selector for global & local`);
        });

        it("should not allow empty :global() selectors", async () => {
            await expect(processor.string(
                "./invalid/global.css",
                ".a :global() { }"
            )).rejects.toThrow(`:global(...) must not be empty`);
        });
    });
});
