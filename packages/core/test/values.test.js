"use strict";

var path = require("path"),
    dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("values", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });
        
        it("should fail on invalid value syntax", () =>
            processor.string(
                "./invalid/value.css",
                "@value foo, bar from nowhere.css"
            )
            .catch((error) =>
                expect(error.message).toMatch(`SyntaxError: Expected quoted source reference but "n" found.`)
            )
        );

        it("should fail if a value imports a non-existant reference", () =>
            processor.string(
                "./invalid/value.css",
                "@value not-real from \"../local.css\";"
            )
            .catch((error) =>
                expect(error.message).toMatch(
                    `Unable to locate "../local.css" from "${path.resolve("invalid/value.css")}"`
                )
            )
        );

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
            
            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support parameterized values", async () => {
            await processor.string(
                "./values.css",
                dedent(`
                    @value a(one): red $one;
                    @value params(arg): rgba($arg, $arg, $arg, 0.5);

                    .a {
                        color: a(foo);
                        background-color: params(128);
                    }
                `)
            );

            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support parameterized values that use static values", async () => {
            await processor.string(
                "./values.css",
                dedent(`
                    @value foo: bar;
                    @value a(one): foo $one;

                    .a {
                        color: a(bar);
                    }
                `)
            );

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });

        it("should support local values in value composition", async () => {
            const result = await processor.string(
                "./packages/core/test/specimens/simple.css",
                dedent(`
                    @value o: one;
                    @value local: './local.css';
                    @value o from local;
                    .fooga { background: one; }
                `)
            );
            
            expect(result.exports).toMatchSnapshot();
        });

        it("should support importing variables from a file", async () => {
            await processor.file(require.resolve("./specimens/value-import.css"));

            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support exporting imported variables", async () => {
            await processor.file(require.resolve("./specimens/value-export.css"));

            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support value composition", async () => {
            await processor.file(require.resolve("./specimens/value-composition.css"));

            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support value namespaces", async () => {
            await processor.file(require.resolve("./specimens/value-namespace.css"));

            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support value replacement in :external(...)", async () => {
            await processor.file(require.resolve("./specimens/externals.css"));

            const result = await processor.output();
            
            expect(result.css).toMatchSnapshot();
        });

        it("should support importing functions from a file", async () => {
            await processor.file(require.resolve("./specimens/function-import.css"));

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });

        it("should support importing namespaced functions from file", async () => {
            await processor.file(require.resolve("./specimens/function-namespace.css"));

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });
    });
});
