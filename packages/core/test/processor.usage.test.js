"use strict";

var path = require("path"),
    
    dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

function relative(files) {
    return files.map((file) => path.relative(process.cwd(), file));
}

describe("/processor.js", () => {
    describe("usage", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });
        
        describe("getters", () => {
            describe(".file", () => {
                it("should return all the files that have been added", () =>
                    processor.file(
                        "./packages/core/test/specimens/start.css"
                    )
                    .then(() => processor.file("./packages/core/test/specimens/local.css"))
                    .then(() =>
                        expect(
                            relative(Object.keys(processor.files))
                        )
                        .toMatchSnapshot()
                    )
                );
            });

            describe(".options", () => {
                it("should return the merged options object", () =>
                    expect(typeof processor.options).toBe("object")
                );
            });
        });
        
        describe("invalid compositions", () => {
            it("should fail on invalid value syntax", () =>
                processor.string(
                    "./invalid/value.css",
                    "@value foo, bar from nowhere.css"
                )
                .catch((error) =>
                    expect(error.message).toMatch(`SyntaxError: Expected source but "n" found.`)
                )
            );

            it("should fail on invalid composes syntax", () =>
                processor.string(
                    "./invalid/value.css",
                    ".a { composes: foo from nowhere.css; }"
                )
                .catch((error) =>
                    expect(error.message).toMatch(`SyntaxError: Expected source but "n" found.`)
                )
            );

            it("should fail if a value imports a non-existant reference", () =>
                processor.string(
                    "./invalid/value.css",
                    "@value not-real from \"../local.css\";"
                )
                .catch((error) =>
                    expect(error.message).toMatch(`Unable to locate "../local.css" from`)
                )
            );
            
            it("should fail if a composition imports a non-existant reference", () =>
                processor.string(
                    "./invalid/composition.css",
                    ".wooga { composes: fake from \"../local.css\"; }"
                )
                .catch((error) =>
                    expect(error.message).toMatch(`Unable to locate "../local.css" from`)
                )
            );
        });

        describe("scoping", () => {
            it("should scope classes, ids, and keyframes", () =>
                processor.string(
                    "./simple.css",
                    dedent(`
                        @keyframes kooga { }
                        #fooga { }
                        .wooga { }
                        .one,
                        .two { }
                    `)
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();

                    return processor.output();
                })
                .then((output) =>
                    expect(output.css).toMatchSnapshot()
                )
            );

            it("should handle pseudo classes correctly", () =>
                processor.string(
                    "./simple.css",
                    dedent(`
                        :global(.g1) {}
                        .b :global(.g2) {}
                        :global(#c) {}
                        .d:hover {}
                        .e:not(.e) {}
                    `)
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();

                    return processor.output();
                })
                .then((output) =>
                    expect(output.css).toMatchSnapshot()
                )
            );

            it("should not allow :global classes to overlap with local ones (local before global)", () =>
                processor.string(
                    "./invalid/global.css",
                    dedent(`
                        .a {}
                        :global(.a) {}
                    `)
                )
                .catch((error) =>
                    expect(error.message).toMatch(`Unable to re-use the same selector for global & local`)
                )
            );

            it("should not allow :global classes to overlap with local ones (global before local)", () =>
                processor.string(
                    "./invalid/global.css",
                    dedent(`
                        :global(.a) {}
                        .a {}
                    `)
                )
                .catch((error) =>
                    expect(error.message).toMatch(`Unable to re-use the same selector for global & local`)
                )
            );

            it("should not allow empty :global() selectors", () =>
                processor.string(
                    "./invalid/global.css",
                    ".a :global() { }"
                )
                .catch((error) =>
                    expect(error.message).toMatch(`:global(...) must not be empty`)
                )
            );
        });

        describe("values", () => {
            it("should support simple values", () =>
                processor.string(
                    "./values.css",
                    dedent(`
                        @value a: red;

                        .a { color: a; }
                    `)
                )
                .then(() => processor.output())
                .then((result) =>
                    expect(result.css).toMatchSnapshot()
                )
            );
            
            it("should support local values in value composition", () =>
                processor.string(
                    "./packages/core/test/specimens/simple.css",
                    dedent(`
                        @value local: './local.css';
                        @value one from local;
                        .fooga { background: one; }
                    `)
                )
                .then((result) =>
                    expect(result.exports).toMatchSnapshot()
                )
            );

            it("should support value composition", () =>
                processor.file(require.resolve("./specimens/value-composition.css"))
                .then(() => processor.output())
                .then((result) =>
                    expect(result.css).toMatchSnapshot()
                )
            );
        });

        describe("externals", () => {
            it("should support overriding external values", () =>
                processor.file(
                    "./packages/core/test/specimens/externals.css"
                )
                .then(() => processor.output())
                .then((result) =>
                    expect(result.css).toMatchSnapshot()
                )
            );
        });

        describe("exports", () => {
            it("should export an object of arrays containing strings", () =>
                processor.string(
                    "./simple.css",
                    dedent(`
                        .red { color: red; }
                        .black { background: #000; }
                        .one, .two { composes: red, black; }
                    `)
                )
                .then((result) =>
                    expect(result.exports).toMatchSnapshot()
                )
            );

            it("should export identifiers and their classes", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((output) =>
                    expect(output.compositions).toMatchSnapshot()
                )
            );
        });

        it("should support unicode classes & ids", () =>
            processor.file(
                "./packages/core/test/specimens/processor/unicode.css"
            )
            .then(() => processor.output({ to : "./packages/core/test/output/processor/unicode.css" }))
            .then((output) =>
                expect(output.css).toMatchSnapshot()
            )
        );
    });
});
