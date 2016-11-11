"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    Processor = require("../src/processor"),
    
    compare = require("./lib/compare-files"),
    warn    = require("./lib/warn");

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
            var invalid = "Unable to locate \"../local.css\" from \"" + path.resolve("invalid") + "\"";
            
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
                    "@keyframes kooga { } #fooga { } .wooga { }"
                )
                .then((result) => {
                    var file = result.files[path.resolve("./test/specimens/simple.css")];
                    
                    assert.deepEqual(result.exports, {
                        fooga : [ "mc08e91a5b_fooga" ],
                        wooga : [ "mc08e91a5b_wooga" ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.exports, {
                        fooga : [ "mc08e91a5b_fooga" ],
                        wooga : [ "mc08e91a5b_wooga" ]
                    });

                    assert.equal(file.text, "@keyframes kooga { } #fooga { } .wooga { }");
                    assert.equal(
                        file.processed.root.toResult().css,
                        "@keyframes mc08e91a5b_kooga { } " +
                        "#mc08e91a5b_fooga { } " +
                        ".mc08e91a5b_wooga { }"
                    );
                });
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
                    ".fooga { color: red; } .booga { background: #000; } .tooga { composes: fooga, booga; }"
                )
                .then((result) => {
                    assert.deepEqual(result.exports, {
                        fooga : [ "mc08e91a5b_fooga" ],
                        booga : [ "mc08e91a5b_booga" ],
                        tooga : [ "mc08e91a5b_fooga", "mc08e91a5b_booga", "mc08e91a5b_tooga" ]
                    });
                })
                .catch((e) => {
                    throw e;
                })
            });

            it("should export identifiers and their classes", function() {
                return this.processor.file(
                    "./test/specimens/start.css"
                )
                .then((result) => {
                    var file = result.files[path.resolve("./test/specimens/start.css")];
                
                    assert.deepEqual(result.exports, {
                        wooga : [ "mc04cb4cb2_booga", "mc61f0515a_wooga" ],
                        booga : [ "mc61f0515a_booga" ],
                        tooga : [ "mc61f0515a_tooga" ]
                    });

                    assert.equal(file.text, fs.readFileSync("./test/specimens/start.css", "utf8"));
                    assert.equal(
                        file.processed.root.toResult().css,
                        ".mc61f0515a_booga { color: red; background: blue; }\n" +
                        ".mc61f0515a_tooga { border: 1px solid white; }\n"
                    );

                    assert.equal(file.values.folder.value, "white");
                    assert.equal(file.values.one.value, "red");
                    assert.equal(file.values.two.value, "blue");

                    assert.deepEqual(file.exports, {
                        wooga : [ "mc04cb4cb2_booga", "mc61f0515a_wooga" ],
                        booga : [ "mc61f0515a_booga" ],
                        tooga : [ "mc61f0515a_tooga" ]
                    });

                    file = result.files[path.resolve("./test/specimens/local.css")];

                    assert.equal(file.text, fs.readFileSync("./test/specimens/local.css", "utf8"));
                    assert.equal(file.processed.root.toResult().css, ".mc04cb4cb2_booga { background: green; }\n");

                    assert.equal(file.values.folder.value, "white");
                    assert.equal(file.values.one.value, "red");
                    assert.equal(file.values.two.value, "blue");

                    assert.deepEqual(file.exports, {
                        booga : [ "mc04cb4cb2_booga" ],
                        looga : [ "mc04cb4cb2_booga", "mc04cb4cb2_looga" ]
                    });

                    file = result.files[path.resolve("./test/specimens/folder/folder.css")];

                    assert.equal(file.text, fs.readFileSync("./test/specimens/folder/folder.css", "utf8"));
                    assert.equal(file.processed.root.toResult().css, ".mc04bb002b_folder { margin: 2px; }\n");

                    assert.equal(file.values.folder.value, "white");
                    
                    assert.deepEqual(file.exports, {
                        folder : [ "mc04bb002b_folder" ]
                    });
                });
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
