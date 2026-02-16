const { describe, it, beforeEach } = require("node:test");

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

        it("should scope classes, ids, and keyframes", async (t) => {
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
            

            t.assert.snapshot(exports);

            const { css } = await processor.output();
            
            t.assert.snapshot(css);
        });

        it("should handle pseudo classes correctly", async (t) => {
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

            t.assert.snapshot(exports);

            const { css } = await processor.output();
            
            t.assert.snapshot(css);
        });

        it("should not allow :global classes to overlap with local ones (local before global)", async (t) => {
            await t.assert.rejects(
                async () => processor.string(
                    "./invalid/global.css",
                    dedent(`
                        .a {}
                        :global(.a) {}
                    `)
                ),
                `Unable to re-use the same selector for global & local`
            );
        });

        it("should allow :global classes to overlap with local ones (local before global) with exportGlobals : false", async (t) => {
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
            
            t.assert.snapshot(css);
        });

        it("should not allow :global classes to overlap with local ones (global before local)", async (t) => {
            await t.assert.rejects(
                async () => processor.string(
                    "./invalid/global.css",
                    dedent(`
                        :global(.a) {}
                        .a {}
                    `)
                ),
                `Unable to re-use the same selector for global & local`
            );
        });

        it("should allow :global classes to overlap with local ones (global before local) with exportGlobals : false", async (t) => {
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
            
            t.assert.snapshot(css);
        });

        it("should not allow empty :global() selectors", async (t) => {
            await t.assert.rejects(
                async () => processor.string(
                    "./invalid/global.css",
                    ".a :global() { }"
                ),
                `:global(...) must not be empty`
            );
        });

        it("should leave unknown animation names alone", async (t) => {
            await processor.string("./unknown-name.css", dedent(`
                .a { animation: a; }
                .b { animation-name: b; }
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });

        it("should not scope rules within @keyframes", async (t) => {
            await processor.string("./unknown-name.css", dedent(`
                @keyframes a {
                    from { color: white; }
                    50.25% { color: red; }
                    to { color: black; }
                }

                .a { animation: a; }
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });
        
        it("should update animation declarations", async (t) => {
            await processor.string("./animation.css", dedent(`
                @keyframes a {}
                .b { animation: a; }
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });

        it("should update animation-name declarations", async (t) => {
            await processor.string("./animation-name.css", dedent(`
                @keyframes a {}
                .b { animation-name: a; }
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });

        // Issue 208
        it("should update multiple animations properly", async (t) => {
            await processor.string("./multiple-animations.css", dedent(`
                @keyframes a {}
                @keyframes b {}
                .c { animation: a 10s linear, b 0.2s infinite; }
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });

        it("should update prefixed @keyframes", async (t) => {
            await processor.string("./prefixed-animations.css", dedent(`
                @-webkit-keyframes a {}
                .b { animation: a; }
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });

        it("should update animation-name declarations when @keyframes come after", async (t) => {
            await processor.string("./animation-name.css", dedent(`
                .b { animation-name: a; }
                @keyframes a {}
            `));

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });
    });
});
