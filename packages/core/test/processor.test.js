"use strict";

var dedent = require("dedent"),
    
    Processor = require("../processor.js");

describe("/processor.js", function() {
    describe("Basics", function() {
        it("should be a function", function() {
            expect(typeof Processor).toBe("function");
        });
        
        it("should auto-instantiate if called without new", function() {
            /* eslint new-cap:0 */
            expect(Processor()).toBeInstanceOf(Processor);
        });
    });

    describe("functionality", function() {
        beforeEach(function() {
            this.processor = new Processor({
                namer : (file, selector) => selector
            });
        });
        
        describe("getters", function() {
            describe(".file", function() {
                it("should return all the files that have been added", function() {
                    var processor = this.processor;
                    
                    return processor.file(
                        "./packages/core/test/specimens/start.css"
                    )
                    .then(() => processor.file("./packages/core/test/specimens/local.css"))
                    .then(() => expect(Object.keys(processor.files)).toMatchSnapshot());
                });
            });

            describe(".options", function() {
                it("should return the merged options object", function() {
                    expect(typeof this.processor.options).toBe("object");
                });
            });
        });
        
        describe("bad imports", function() {
            // These can't use expect(...).toThrow() because they're async
            it("should fail if a value imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/value.css",
                    "@value not-real from \"../local.css\";"
                )
                .catch((error) => expect(error.message).toMatch(`Unable to locate "../local.css" from`));
            });
            
            it("should fail if a composition imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/composition.css",
                    ".wooga { composes: fake from \"../local.css\"; }"
                )
                .catch((error) => expect(error.message).toMatch(`Unable to locate "../local.css" from`));
            });
        });

        describe("scoping", function() {
            it("should scope classes, ids, and keyframes", function() {
                return this.processor.string(
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

                    return this.processor.output();
                })
                .then((output) => expect(output.css).toMatchSnapshot());
            });
        });

        describe("values", function() {
            it("should support local values in value composition", function() {
                return this.processor.string(
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
                return this.processor.file(
                    "./packages/core/test/specimens/externals.css"
                )
                .then(() => this.processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
            });
        });

        describe("exports", function() {
            it("should export an object of arrays containing strings", function() {
                return this.processor.string(
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
                return this.processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => this.processor.output())
                .then((output) => expect(output.compositions).toMatchSnapshot());
            });
        });

        it("should support unicode classes & ids", function() {
            var processor = new Processor({
                    namer : (file, selector) => selector
                });
            
            return processor.file(
                "./packages/core/test/specimens/processor/unicode.css"
            )
            .then(() => processor.output({ to : "./packages/core/test/output/processor/unicode.css" }))
            .then((output) => expect(output.css).toMatchSnapshot());
        });
    });
});
