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
            try {
                await processor.string(
                    "./invalid/value.css",
                    ".a { composes: b from nowhere.css; }"
                );
            } catch({ message }) {
                expect(message).toMatch(`SyntaxError: Expected global or source but "n" found.`);
            }
        });

        it("should fail if a composition references a non-existant class", async () => {
            try {
                await processor.string(
                    "./invalid-composition.css",
                    ".a { composes: b; }"
                );
            } catch({ message }) {
                expect(message).toMatch(`Invalid composes reference`);
            }
        });

        it("should fail if a composition references a non-existant file", async () => {
            try {
                await processor.string(
                    "./invalid-composition.css",
                    `.a { composes: b from "../local.css"; }`
                );
            } catch({ message }) {
                expect(message).toMatch(
                    `Unable to locate "../local.css" from "${path.resolve("invalid-composition.css")}"`
                );
            }
        });

        it("should fail if a composition references a non-existant file from a custom resolver", async () => {
            processor = new Processor({
                namer,
                resolvers : [
                    (from, file, resolve) => `${resolve(from, file)}a`,
                ],
            });

            try {
                await processor.file(require.resolve("./specimens/composes.css"));
            } catch(e) {
                const { message } = e;

                expect(message).toMatch(
                    `no such file or directory, open '${require.resolve("./specimens/folder/folder2.css")}a'`
                );
            }
        });

        it("should fail on rules that use multiple selectors", async () => {
            try {
                await processor.string(
                    "./invalid/composes-first.css",
                    dedent(`
                        .a { color: red; }
                        .b .c { composes: a; }
                    `)
                );
            } catch({ message }) {
                expect(message).toMatch(`Only simple singular selectors may use composition`);
            }
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

        it("should compose multiple classes", async () => {
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

        it("should compose from other files", async () => {
            await processor.file(require.resolve("./specimens/composes.css"));

            const { compositions } = await processor.output();

            expect(compositions).toMatchSnapshot();
        });
    });
});
