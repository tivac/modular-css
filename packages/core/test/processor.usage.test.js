"use strict";

var path = require("path"),
    
    dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

function relative(files) {
    return files.map((file) => path.relative(process.cwd(), file));
}

describe("/processor.js", function() {
    describe("usage", function() {
        var processor;
        
        beforeEach(function() {
            processor = new Processor({
                namer
            });
        });
        
        describe("getters", function() {
            describe(".file", function() {
                it("should return all the files that have been added", function() {
                    return processor.file(
                        "./packages/core/test/specimens/start.css"
                    )
                    .then(() => processor.file("./packages/core/test/specimens/local.css"))
                    .then(() =>
                        expect(
                            relative(Object.keys(processor.files))
                        )
                        .toMatchSnapshot()
                    );
                });
            });

            describe(".options", function() {
                it("should return the merged options object", function() {
                    expect(typeof processor.options).toBe("object");
                });
            });
        });
        
        describe("bad imports", function() {
            // These can't use expect(...).toThrow() because they're async
            it("should fail if a value imports a non-existant reference", function() {
                return processor.string(
                    "./invalid/value.css",
                    "@value not-real from \"../local.css\";"
                )
                .catch((error) => expect(error.message).toMatch(`Unable to locate "../local.css" from`));
            });
            
            it("should fail if a composition imports a non-existant reference", function() {
                return processor.string(
                    "./invalid/composition.css",
                    ".wooga { composes: fake from \"../local.css\"; }"
                )
                .catch((error) => expect(error.message).toMatch(`Unable to locate "../local.css" from`));
            });
        });

        describe("scoping", function() {
            it.only("should scope classes, ids, and keyframes", function() {
                return processor.string(
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
                .then((output) => expect(output.css).toMatchSnapshot());
            });
        });

        describe("values", function() {
            it("should support local values in value composition", function() {
                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    dedent(`
                        @value local: './local.css';
                        @value one from local;
                        .fooga { background: one; }
                    `)
                )
                .then((result) => expect(result.exports).toMatchSnapshot());
            });
        });

        describe("externals", function() {
            it("should support overriding external values", function() {
                return processor.file(
                    "./packages/core/test/specimens/externals.css"
                )
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
        });

        describe("exports", function() {
            it("should export an object of arrays containing strings", function() {
                return processor.string(
                    "./simple.css",
                    dedent(`
                        .red { color: red; }
                        .black { background: #000; }
                        .one, .two { composes: red, black; }
                    `)
                )
                .then((result) => expect(result.exports).toMatchSnapshot());
            });

            it("should export identifiers and their classes", function() {
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((output) => expect(output.compositions).toMatchSnapshot());
            });
        });

        it("should support unicode classes & ids", function() {
            return processor.file(
                "./packages/core/test/specimens/processor/unicode.css"
            )
            .then(() => processor.output({ to : "./packages/core/test/output/processor/unicode.css" }))
            .then((output) => expect(output.css).toMatchSnapshot());
        });
    });
});
