"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    Processor = require("../src/processor"),
    
    compare = require("./lib/compare.js");

describe("/processor.js", function() {
    describe("Methods", function() {
        beforeEach(function() {
            this.processor = new Processor();
        });

        describe(".string()", function() {
            it("should process a string", function() {
                return this.processor.string("./test/specimens/simple.css", ".wooga { }").then(function(result) {
                    var file = result.files[path.resolve("./test/specimens/simple.css")];
                
                    assert.deepEqual(result.exports, {
                        wooga : [ "mc08e91a5b_wooga" ]
                    });
                    
                    assert.equal(typeof file, "object");
                    
                    assert.deepEqual(file.exports, {
                        wooga : [ "mc08e91a5b_wooga" ]
                    });
                    
                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.processed.root.toResult().css, ".mc08e91a5b_wooga { }");
                });
            });
        });
        
        describe(".file()", function() {
            it("should process a file", function() {
                return this.processor.file("./test/specimens/simple.css").then(function(result) {
                    var file = result.files[path.resolve("./test/specimens/simple.css")];
                    
                    assert.deepEqual(result.exports, {
                        wooga : [ "mc08e91a5b_wooga" ]
                    });
                    
                    assert.equal(typeof file, "object");
                    
                    assert.deepEqual(file.exports, {
                        wooga : [ "mc08e91a5b_wooga" ]
                    });
                    
                    assert.equal(file.text, ".wooga { color: red; }\n");
                    assert.equal(file.processed.root.toResult().css, ".mc08e91a5b_wooga { color: red; }\n");
                });
            });
        });
        
        describe(".remove()", function() {
            it("should remove a file", function() {
                var processor = this.processor;

                return processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                )
                .then(() => {
                    processor.remove(path.resolve("./test/specimens/simple.css"));
                    
                    assert.deepEqual(processor.dependencies(), []);
                });
            });
            
            it("should remove multiple files", function() {
                var processor = this.processor;
                
                return Promise.all([
                    processor.string("./test/specimens/a.css", ".aooga { }"),
                    processor.string("./test/specimens/b.css", ".booga { }"),
                    processor.string("./test/specimens/c.css", ".cooga { }")
                ])
                .then(() => {
                    processor.remove([
                        path.resolve("./test/specimens/a.css"),
                        path.resolve("./test/specimens/b.css")
                    ]);
                    
                    assert.deepEqual(processor.dependencies(), [
                        path.resolve("./test/specimens/c.css")
                    ]);
                });
            });
        });
        
        describe(".dependencies()", function() {
            it("should return the dependencies of the specified file", function() {
                var processor = this.processor;

                return processor.file(
                    "./test/specimens/start.css"
                )
                .then(() => assert.deepEqual(
                    processor.dependencies(path.resolve("./test/specimens/start.css")),
                    [
                        path.resolve("./test/specimens/folder/folder.css"),
                        path.resolve("./test/specimens/local.css")
                    ]
                ));
            });
            
            it("should return the overall order of dependencies if no file is specified", function() {
                var processor = this.processor;

                return processor.file(
                    "./test/specimens/start.css"
                )
                .then(() => assert.deepEqual(processor.dependencies(), [
                    path.resolve("./test/specimens/folder/folder.css"),
                    path.resolve("./test/specimens/local.css"),
                    path.resolve("./test/specimens/start.css")
                ]));
            });
        });
        
        describe(".output()", function() {
            it("should return a postcss result", function() {
                var processor = this.processor;

                return processor.file("./test/specimens/start.css").then(function() {
                    return processor.output();
                })
                .then(function(result) {
                    compare.stringToFile(result.css, "./test/results/processor/start.css");
                });
            });
            
            it("should generate css representing the output from all added files", function() {
                var processor = this.processor;

                return Promise.all([
                    processor.file("./test/specimens/start.css"),
                    processor.file("./test/specimens/simple.css")
                ])
                .then(() => processor.output())
                .then((result) => compare.stringToFile(result.css, "./test/results/processor/output-all.css"));
            });

            it("should avoid duplicating files in the output", function() {
                var processor = this.processor;

                return Promise.all([
                    processor.file("./test/specimens/start.css"),
                    processor.file("./test/specimens/local.css")
                ])
                .then(() => processor.output())
                .then((result) => compare.stringToFile(result.css, "./test/results/processor/avoid-duplicates.css"));
            });
            
            it("should generate a JSON structure of all the compositions", function() {
                var processor = this.processor;

                return processor.file(
                    "./test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => {
                    assert("compositions" in result);
                    assert.equal(typeof result.compositions, "object");
                    
                    assert.deepEqual(
                        result.compositions,
                        {
                            "test/specimens/folder/folder.css" : {
                                folder : "mc04bb002b_folder"
                            },
                            
                            "test/specimens/local.css" : {
                                booga : "mc04cb4cb2_booga",
                                looga : "mc04cb4cb2_booga mc04cb4cb2_looga"
                            },
                            
                            "test/specimens/start.css" : {
                                booga : "mc61f0515a_booga",
                                tooga : "mc61f0515a_tooga",
                                wooga : "mc04cb4cb2_booga mc61f0515a_wooga"
                            }
                        }
                    );
                });
            });
            
            it("should order output by dependencies, then alphabetically", function() {
                var processor = this.processor;
                
                return Promise.all([
                    processor.file("./test/specimens/start.css"),
                    processor.file("./test/specimens/local.css"),
                    processor.file("./test/specimens/composes.css"),
                    processor.file("./test/specimens/deep.css")
                ])
                .then(() => processor.output())
                .then((result) => compare.stringToFile(result.css, "./test/results/processor/sorting.css"));
            });
        });
    });
});
