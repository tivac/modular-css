"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),

    leading = require("common-tags").stripIndent,
    
    Processor = require("../src/processor.js"),
    
    compare = require("./lib/compare.js");

describe("/processor.js", function() {
    describe("Basics", function() {
        it("should be a function", function() {
            assert.equal(typeof Processor, "function");
        });
        
        it("should auto-instantiate if called without new", function() {
            /* eslint new-cap:0 */
            assert(Processor() instanceof Processor);
        });
    });

    describe("functionality", function() {
        beforeEach(function() {
            this.processor = new Processor();
        });
        
        describe("getters", function() {
            describe(".file", function() {
                it("should return all the files that have been added", function() {
                    var processor = this.processor;
                    
                    return processor.file(
                        "./test/specimens/start.css"
                    )
                    .then(() => processor.file("./test/specimens/local.css"))
                    .then(() => {
                        assert.equal(typeof processor.files, "object");
                        
                        assert.equal(Object.keys(processor.files).length, 3);
                        
                        assert(path.resolve("./test/specimens/local.css") in processor.files);
                        assert(path.resolve("./test/specimens/start.css") in processor.files);
                        assert(path.resolve("./test/specimens/folder/folder.css") in processor.files);
                    });
                });
            });
        });
        
        describe("bad imports", function() {
            var invalid = `Unable to locate "../local.css" from "${path.resolve("invalid")}"`;
            
            it("should fail if a value imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/value.css",
                    "@value not-real from \"../local.css\";"
                )
                .catch((error) => assert.equal(error.message, invalid));
            });
            
            it("should fail if a composition imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/composition.css",
                    ".wooga { composes: fake from \"../local.css\"; }"
                )
                .catch((error) => assert.equal(error.message, invalid));
            });
        });

        describe("scoping", function() {
            it("should scope classes, ids, and keyframes", function() {
                return this.processor.string(
                    "./test/specimens/simple.css",
                    leading`
                        @keyframes kooga { }
                        #fooga { }
                        .wooga { }
                        .one,
                        .two { }
                    `
                )
                .then((result) => {
                    assert.deepEqual(result.exports, {
                        fooga : [ "mc08e91a5b_fooga" ],
                        wooga : [ "mc08e91a5b_wooga" ],
                        one   : [ "mc08e91a5b_one" ],
                        two   : [ "mc08e91a5b_two" ]
                    });

                    return this.processor.output();
                })
                .then((output) =>
                    assert.equal(
                        output.css,
                        leading`
                            /* test/specimens/simple.css */
                            @keyframes mc08e91a5b_kooga {}
                            #mc08e91a5b_fooga {}
                            .mc08e91a5b_wooga {}
                            .mc08e91a5b_one,
                            .mc08e91a5b_two {}
                        `
                    )
                );
            });
        });

        describe("values", function() {
            it("should support local values in value composition", function() {
                return this.processor.string(
                    "./test/specimens/simple.css",
                    "@value local: './local.css'; @value one from local; .fooga { background: one; }"
                )
                .then((result) => assert.deepEqual(result.exports, {
                    fooga : [ "mc08e91a5b_fooga" ]
                }));
            });
        });

        describe("externals", function() {
            it("should support overriding external values", function() {
                return this.processor.file(
                    "./test/specimens/externals.css"
                )
                .then(() => this.processor.output())
                .then((result) => compare.stringToFile(result.css, "./test/results/processor/externals.css"));
            });
        });

        describe("exports", function() {
            it("should export an object of arrays containing strings", function() {
                return this.processor.string(
                    "./test/specimens/simple.css",
                    ".red { color: red; } .black { background: #000; } .one, .two { composes: red, black; }"
                )
                .then((result) => assert.deepEqual(result.exports, {
                    red   : [ "mc08e91a5b_red" ],
                    black : [ "mc08e91a5b_black" ],
                    one   : [ "mc08e91a5b_red", "mc08e91a5b_black", "mc08e91a5b_one" ],
                    two   : [ "mc08e91a5b_red", "mc08e91a5b_black", "mc08e91a5b_two" ]
                }))
                .catch((e) => {
                    throw e;
                })
            });

            it("should export identifiers and their classes", function() {
                return this.processor.file(
                    "./test/specimens/start.css"
                )
                .then((result) => this.processor.output())
                .then((output) => assert.deepEqual(
                    output.compositions,
                    {
                        "test/specimens/folder/folder.css" : {
                            "folder" : "mc04bb002b_folder"
                        },
                        "test/specimens/local.css" : {
                            "booga" : "mc04cb4cb2_booga",
                            "looga" : "mc04cb4cb2_booga mc04cb4cb2_looga"
                        },
                        "test/specimens/start.css" : {
                            "booga" : "mc61f0515a_booga",
                            "tooga" : "mc61f0515a_tooga",
                            "wooga" : "mc04cb4cb2_booga mc61f0515a_wooga"
                        }
                    }
                ));
            });
        });

        it("should support unicode classes & ids", function() {
            var processor = new Processor({
                    namer : (file, selector) => selector
                });
            
            return processor.file(
                "./test/specimens/processor/unicode.css"
            )
            .then(() => processor.output({ to : "./test/output/processor/unicode.css" }))
            .then((output) => compare.stringToFile(output.css, "./test/results/processor/unicode.css"));
        });
    });
});
