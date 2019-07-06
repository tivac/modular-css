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
            try {
                await processor.string(
                    "./invalid/global.css",
                    dedent(`
                        .a {}
                        :global(.a) {}
                    `)
                );
            } catch({ message }) {
                expect(message).toMatch(`Unable to re-use the same selector for global & local`);
            }
        });

        it("should not allow :global classes to overlap with local ones (global before local)", async () => {
            try {
                await processor.string(
                    "./invalid/global.css",
                    dedent(`
                        :global(.a) {}
                        .a {}
                    `)
                );
            } catch({ message }) {
                expect(message).toMatch(`Unable to re-use the same selector for global & local`);
            }
        });

        it("should not allow empty :global() selectors", async () => {
            try {
                await processor.string(
                    "./invalid/global.css",
                    ".a :global() { }"
                );
            } catch({ message }) {
                expect(message).toMatch(`:global(...) must not be empty`);
            }
        });
    });
});
