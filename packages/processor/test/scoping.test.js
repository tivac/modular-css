"use strict";

const dedent = require("dedent");
const namer = require("@modular-css/test-utils/namer.js");
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
                    @keyframes kooga {}
                    #fooga { }
                    .wooga { }
                    .one,
                    .two { }
                    .one { }
                    @media print {
                        .three {}
                    }
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

        it("should allow :global classes to overlap with local ones (local before global) with exportGlobals : false", async () => {
            processor = new Processor({
                namer,
                exportGlobals : false,
            });
            
            await processor.string(
                "./valid/global.css",
                dedent(`
                    .a {}
                    :global(.a) {}
                `)
            );

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
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

        it("should allow :global classes to overlap with local ones (global before local) with exportGlobals : false", async () => {
            processor = new Processor({
                namer,
                exportGlobals : false,
            });
            
            await processor.string(
                "./valid/global.css",
                dedent(`
                    :global(.a) {}
                    .a {}
                `)
            );

            const { css } = await processor.output();
            
            expect(css).toMatchSnapshot();
        });

        it("should not allow empty :global() selectors", async () => {
            await expect(processor.string(
                "./invalid/global.css",
                ".a :global() { }"
            )).rejects.toThrow(`:global(...) must not be empty`);
        });

        it("should leave unknown animation names alone", async () => {
            await processor.string("./unknown-name.css", dedent(`
                .a { animation: a; }
                .b { animation-name: b; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should not scope rules within @keyframes", async () => {
            await processor.string("./unknown-name.css", dedent(`
                @keyframes a {
                    from { color: white; }
                    50.25% { color: red; }
                    to { color: black; }
                }

                .a { animation: a; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });
        
        it("should update animation declarations", async () => {
            await processor.string("./animation.css", dedent(`
                @keyframes a {}
                .b { animation: a; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should update animation-name declarations", async () => {
            await processor.string("./animation-name.css", dedent(`
                @keyframes a {}
                .b { animation-name: a; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        // Issue 208
        it("should update multiple animations properly", async () => {
            await processor.string("./multiple-animations.css", dedent(`
                @keyframes a {}
                @keyframes b {}
                .c { animation: a 10s linear, b 0.2s infinite; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should update prefixed @keyframes", async () => {
            await processor.string("./prefixed-animations.css", dedent(`
                @-webkit-keyframes a {}
                .b { animation: a; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should update animation-name declarations when @keyframes come after", async () => {
            await processor.string("./animation-name.css", dedent(`
                .b { animation-name: a; }
                @keyframes a {}
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });
    });
});
