"use strict";

const dedent = require("dedent");

const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

const id = "./packages/processor/test/specimens/at-composes.css";

describe("/processor.js", () => {
    describe("@composes", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should include exported classes from the composed file", async () => {
            const { exports } = await processor.string(id, dedent(`
                @composes "./local.css";

                .a {
                    color: aqua;
                }

                .b {
                    color: blue;
                }
            `));

            expect(exports).toMatchSnapshot();

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should not include exported values from the composed file", async () => {
            const { exports } = await processor.string(id, dedent(`
                @composes "./values.css";
            `));

            expect(exports).toMatchSnapshot();
        });

        it("should allow composing classes from the composed file", async () => {
            const { exports } = await processor.string(id, dedent(`
                @composes "./simple.css";

                .a {
                    composes: wooga;

                    color: aqua;
                }

                .b {
                    color: blue;
                }
            `));

            expect(exports).toMatchSnapshot();
        });

        it("should include compositions from the composed file", async () => {
            await processor.string(id, dedent(`
                @composes "./simple.css";

                .a {
                    color: aqua;
                }

                .b {
                    composes: wooga;

                    color: blue;
                }
            `));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should include external compositions from the composed file", async () => {
            await processor.string(id, dedent(`
                @composes "./start.css";

                .a {
                    color: aqua;
                }

                .b {
                    composes: wooga;

                    color: blue;
                }
            `));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should output css from the composed file", async () => {
            await processor.string(id, dedent(`
                @composes "./simple.css";

                .a {
                    color: aqua;
                }

                .b {
                    composes: wooga;

                    color: blue;
                }
            `));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should allow for chains of @composes-included files", async () => {
            const { exports } = await processor.string("./packages/processor/test/specimens/at-composes-child.css", dedent(`
                @composes "./at-composes.css";

                .a {
                    composes: notblue;

                    color: aqua;
                }

                .b {
                    composes: wooga;

                    color: blue;
                }
            `));

            expect(exports).toMatchSnapshot();
        });

        it("should only allow a single @composes per file", async () => {
            await expect(processor.string(id, dedent(`
                @composes "./simple.css";
                @composes "./blue.css";

            `))).rejects.toThrow(`Only one @composes rule per file`);
        });
    });
});
