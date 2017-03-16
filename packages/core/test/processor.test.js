"use strict";

var path    = require("path"),
    assert  = require("assert"),

    leading = require("dentist").dedent,
    
    Processor = require("../processor.js"),
    
    compare = require("test-utils/compare.js")(__dirname);

describe("/processor.js", function() {
    describe("Basics", function() {
        it("should be a function", function() {
            expect(typeof Processor).toBe("function");
        });
        
        it("should auto-instantiate if called without new", function() {
            /* eslint new-cap:0 */
            assert(Processor() instanceof Processor);
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
                    .then(() => {
                        expect(typeof processor.files).toBe("object");
                        
                        expect(Object.keys(processor.files).length).toBe(3);
                        
                        assert(path.resolve("./packages/core/test/specimens/local.css") in processor.files);
                        assert(path.resolve("./packages/core/test/specimens/start.css") in processor.files);
                        assert(path.resolve("./packages/core/test/specimens/folder/folder.css") in processor.files);
                    });
                });
            });
        });
        
        describe("bad imports", function() {
            it("should fail if a value imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/value.css",
                    "@value not-real from \"../local.css\";"
                )
                .catch((error) => expect(error.message).toBe(
                    `Unable to locate "../local.css" from "${path.resolve("./invalid/value.css")}"`
                ));
            });
            
            it("should fail if a composition imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/composition.css",
                    ".wooga { composes: fake from \"../local.css\"; }"
                )
                .catch((error) => expect(error.message).toBe(
                    `Unable to locate "../local.css" from "${path.resolve("./invalid/composition.css")}"`
                ));
            });
        });

        describe("scoping", function() {
            it("should scope classes, ids, and keyframes", function() {
                return this.processor.string(
                    "./packages/core/test/specimens/simple.css",
                    leading(`
                        @keyframes kooga { }
                        #fooga { }
                        .wooga { }
                        .one,
                        .two { }
                    `)
                )
                .then((result) => {
                    expect(result.exports).toEqual({
                        fooga : [ "fooga" ],
                        wooga : [ "wooga" ],
                        one   : [ "one" ],
                        two   : [ "two" ]
                    });

                    return this.processor.output();
                })
                .then((output) =>
                    expect(output.css).toEqual(
                        leading(`
                            /* packages/core/test/specimens/simple.css */
                            @keyframes kooga {}
                            #fooga {}
                            .wooga {}
                            .one,
                            .two {}
                        `)
                    )
                );
            });
        });

        describe("values", function() {
            it("should support local values in value composition", function() {
                return this.processor.string(
                    "./packages/core/test/specimens/simple.css",
                    "@value local: './local.css'; @value one from local; .fooga { background: one; }"
                )
                .then((result) => expect(result.exports).toEqual({
                    fooga : [ "fooga" ]
                }));
            });
        });

        describe("externals", function() {
            it("should support overriding external values", function() {
                return this.processor.file(
                    "./packages/core/test/specimens/externals.css"
                )
                .then(() => this.processor.output())
                .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/processor/externals.css"));
            });
        });

        describe("exports", function() {
            it("should export an object of arrays containing strings", function() {
                return this.processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".red { color: red; } .black { background: #000; } .one, .two { composes: red, black; }"
                )
                .then((result) => expect(result.exports).toEqual({
                    red   : [ "red" ],
                    black : [ "black" ],
                    one   : [ "red", "black", "one" ],
                    two   : [ "red", "black", "two" ]
                }))
                .catch((e) => {
                    throw e;
                });
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
            .then((output) => compare.stringToFile(output.css, "./packages/core/test/results/processor/unicode.css"));
        });
    });
});
