const { describe, it, beforeEach } = require("node:test");

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

        it("should include exported classes from the composed file", async (t) => {
            const { exports } = await processor.string(id, dedent(`
                @composes "./local.css";

                .a {
                    color: aqua;
                }

                .b {
                    color: blue;
                }
            `));

            t.assert.snapshot(exports);

            const { css } = await processor.output();

            t.assert.snapshot(css);
        });

        it("should not include exported values from the composed file", async (t) => {
            const { exports } = await processor.string(id, dedent(`
                @composes "./values.css";
            `));

            t.assert.snapshot(exports);
        });

        it("should allow composing classes from the composed file", async (t) => {
            const { exports } = await processor.string("./packages/processor/test/specimens/a-t-c-o-m-p-o-s-e-s.css", dedent(`
                @composes "./simple.css";

                .a {
                    composes: wooga;

                    color: aqua;
                }

                .b {
                    color: blue;
                }
            `));

            t.assert.snapshot(exports);
        });

        it("should include compositions from the composed file", async (t) => {
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

            t.assert.snapshot(compositions);
        });

        it("should include external compositions from the composed file", async (t) => {
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

            t.assert.snapshot(compositions);
        });

        it("should output css from the composed file", async (t) => {
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

            t.assert.snapshot(css);
        });

        it("should allow for chains of @composes-included files", async (t) => {
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

            t.assert.snapshot(exports);
        });

        it("should only allow a single @composes per file", async (t) => {
            await t.assert.rejects(
                async () => processor.string(id, dedent(`
                    @composes "./simple.css";
                    @composes "./blue.css";

                `)),
                `Only one @composes rule per file`
            );
        });
    });
});
