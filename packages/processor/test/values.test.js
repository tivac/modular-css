"use strict";

const path = require("path");
const dedent = require("dedent");
const namer = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("values", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should fail on invalid value syntax", async () => {
            await expect(processor.string(
                "./invalid/value.css",
                "@value foo, bar from nowhere.css"
            )).rejects.toThrow(`SyntaxError: Expected source but "n" found.`);
        });

        it("should fail if a value imports a non-existant reference", async () => {
            await expect(processor.string(
                "./invalid/value.css",
                "@value not-real from \"../local.css\";"
            )).rejects.toThrow(
                `Unable to locate "../local.css" from "${path.resolve("invalid/value.css")}"`
            );
        });

        it("should fail if a value imports a non-existant value", async () => {
            await expect(processor.string(
                "./packages/processor/test/specimens/simple.css",
                "@value not-real from \"./local.css\";"
            )).rejects.toThrow(
                `Could not find @value not-real in "./local.css"`
            );
        });
        
        it("should fail if a value aliases a non-existant value", async () => {
            await expect(processor.string(
                "./packages/processor/test/specimens/simple.css",
                "@value not-real as stil-no from \"./local.css\";"
            )).rejects.toThrow(
                `Could not find @value not-real in "./local.css"`
            );
        });

        it("shouldn't replace values unless they're safe", async () => {
            await processor.string(
                "./values.css",
                dedent(`
                    @value a: red;
                    @value c: foo-a;
                    @value d:a;

                    .a {
                        color: foo-a;
                        color: foo(a);
                        color: foo_a;
                        color: fooa;
                        color: foo, a;
                        color: foo, a, woo;
                        width: foopx;
                        color:a;
                        color:foo-a;
                        color: d;
                    }

                    @media a { }
                    @media a, b {}
                    @media foo-a, b {}
                    @media foo-a { }
                    @media (min-width: a) { }
                    @media (min-width: foo-a) { }
                    @media not a {}
                    @media not (a) {}
                    @media not foo-a {}
                    @media not (foo-a) {}
                `)
            );

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support simple values", async () => {
            await processor.string(
                "./values.css",
                dedent(`
                    @value a: red;
                    @value b:
                        Segoe UI
                        sans-serif;

                    .a {
                        color: a;
                        font-family: b;
                    }
                `)
            );

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support local values in value composition", async () => {
            await processor.string(
                "./packages/processor/test/specimens/simple.css",
                dedent(`
                    @value o: one;
                    @value local: './local.css';
                    @value o from local;
                    .fooga { background: one; }
                `)
            );

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support importing variables from a file", async () => {
            await processor.file(require.resolve("./specimens/value-import.css"));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support exporting imported variables", async () => {
            await processor.file(require.resolve("./specimens/value-export.css"));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support value composition", async () => {
            await processor.file(require.resolve("./specimens/value-composition.css"));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support value namespaces", async () => {
            await processor.file(require.resolve("./specimens/value-namespace.css"));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support value replacement in :external(...)", async () => {
            await processor.file(require.resolve("./specimens/externals.css"));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });

        it("should support value aliasing", async () => {
            await processor.file(require.resolve("./specimens/value-alias.css"));

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });
    });
});
