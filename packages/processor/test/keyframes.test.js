"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("@keyframes scoping", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
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
        
        it("should update scoped animations from the scoping plugin's message", async () => {
            await processor.string("./animation.css", dedent(`
                @keyframes a {}
                .b { animation: a; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should update the animation-name property", async () => {
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

        it("should update scoped prefixed animations from the scoping plugin's message", async () => {
            await processor.string("./prefixed-animations.css", dedent(`
                @-webkit-keyframes a {}
                .b { animation: a; }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });
    });
});
