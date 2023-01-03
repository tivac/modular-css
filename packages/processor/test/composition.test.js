/* eslint-disable max-statements -- let it go */
"use strict";

const path = require("path");
const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("composition", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should fail on invalid composes syntax", async () => {
            const result = processor.string(
                "./invalid/value.css",
                ".a { composes: b from nowhere.css; }"
            );
            
            await expect(result).rejects.toThrow(`SyntaxError: Expected global, source, or whitespace but "n" found.`);
        });

        it("should fail if a composition references a non-existant class", async () => {
            const result = processor.string(
                "./invalid-composition.css",
                ".a { composes: b; }"
            );
            
            await expect(result).rejects.toThrow(`Invalid composes reference, .b does not exist in invalid-composition.css`);
        });

        it("should fail if a composition references a non-existant file", async () => {
            const result = processor.string(
                "./invalid-composition.css",
                `.a { composes: b from "../local.css"; }`
            );
            
            await expect(result).rejects.toThrow(
                `Unable to locate "../local.css" from "${path.resolve("invalid-composition.css")}"`
            );
        });

        it("should fail if a composition references a non-existant file from a custom resolver", async () => {
            processor = new Processor({
                namer,
                resolvers : [
                    (from, file, resolve) => `${resolve(from, file)}a`,
                ],
            });

            await expect(processor.file(require.resolve("./specimens/composes/external-composes-single-declaration.css"))).rejects.toThrow(
                `no such file or directory, open '${require.resolve("./specimens/deps/classes.css")}a'`
            );
        });

        it("should fail on multiple selectors using composition", async () => {
            await expect(processor.string(
                "./invalid/composes-first.css",
                dedent(`
                    .a { color: red; }
                    .b .c { composes: a; }
                `)
            )).rejects.toThrow(`Only simple singular class selectors may use composition`);
        });

        it("should fail on element selectors using composition", async () => {
            await expect(processor.string(
                "./invalid/composes-first.css",
                dedent(`
                    .a { color: red; }
                    html { composes: a; }
                `)
            )).rejects.toThrow(`Only simple singular class selectors may use composition`);
        });

        it("should fail on pseudo selectors (single-colon) using composition", async () => {
            await expect(processor.string(
                "./invalid/composes-first.css",
                dedent(`
                    .a { color: red; }
                    .b:active { composes: a; }
                `)
            )).rejects.toThrow(`Only simple singular class selectors may use composition`);
        });

        it("should fail on pseudo selectors (double-colon) using composition", async () => {
            await expect(processor.string(
                "./invalid/composes-first.css",
                dedent(`
                    .a { color: red; }
                    .b::after { composes: a; }
                `)
            )).rejects.toThrow(`Only simple singular class selectors may use composition`);
        });

        it("should compose a single class", async () => {
            await processor.string(
                "./single-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { composes: a; }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose a single class (multi-rule dependent class)", async () => {
            await processor.string(
                "./single-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { color: red; }
                    .a { composes: b; }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should allow comments before composes", async () => {
            await processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b {
                        /* comment */
                        composes: a;
                    }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should allow composes anywhere", async () => {
            await processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b {
                        background: blue;
                        composes: a;
                    }
                    .c {
                        border: 1px solid red;
                        composes: a;
                        text-weight: bold;
                        composes: b;
                    }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from globals", async () => {
            await processor.string(
                "./global-compose.css",
                dedent(`
                    .a { composes: global(b); }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from global keyword", async () => {
            await processor.string(
                "./global-compose.css",
                dedent(`
                    .a { composes: b, c, d from global; }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose multiple classes (multiple declarations)", async () => {
            await processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { color: blue; }
                    .c {
                        composes: a;
                        composes: b;
                    }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });
        
        it("should compose multiple classes (single declaration)", async () => {
            await processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { color: blue; }
                    .c {
                        composes: a, b;
                    }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose multiple classes (multi-rule dependent class)", async () => {
            await processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { composes: a; }
                    .c { color: blue; }
                    .b { composes: c; }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files in single declaration", async () => {
            await processor.file(require.resolve("./specimens/composes/external-composes-single-declaration.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files in multiple declarations", async () => {
            await processor.file(require.resolve("./specimens/composes/external-composes-multiple-declarations.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose locally and from other files", async () => {
            await processor.file(require.resolve("./specimens/composes/external-first-and-local-second-composes.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files and locally", async () => {
            await processor.file(require.resolve("./specimens/composes/external-second-and-local-first-composes.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files in multiple declarations via local compose", async () => {
            await processor.file(require.resolve("./specimens/composes/external-compose-via-local-compose.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files in multiple declarations via local compose 2", async () => {
            await processor.file(require.resolve("./specimens/composes/external-compose-via-local-compose2.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files in multiple declarations via local compose 3", async () => {
            await processor.file(require.resolve("./specimens/composes/external-compose-via-local-compose3.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose from other files in multiple declarations via local compose 4", async () => {
            await processor.file(require.resolve("./specimens/composes/external-compose-via-local-compose4.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it("should compose with escaped classes", async () => {
            await processor.string(
                "./escaped-classes.css",
                dedent(`
                    .sm\\:foo { color: red; }
                    .c {
                        composes: sm\\:foo;
                    }
                `)
            );

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });

        it.each([
            [ "only composes", dedent(`
                .a { color: red; }
                .b { composes: a; }
            `) ],
            [ "composes first", dedent(`
                .a { color: red; }
                .b { composes: a; background: blue; }
            `) ],
            [ "composes last", dedent(`
                .a { color: red; }
                .b { background: blue; composes: a; }
            `) ],
            [ "composes middle", dedent(`
                .a { color: red; }
                .b { background: blue; composes: a; border-color: green; }
            `) ],
        ])("should remove `composes` from the output css (%s)", async (name, input) => {
            await processor.string("./remove-composes.css", input);

            const { css } = await processor.output();

            expect(css).toMatchSnapshot();
        });
    });
});
