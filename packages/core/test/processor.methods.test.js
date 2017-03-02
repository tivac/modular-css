"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    Processor = require("../processor.js"),
    
    compare = require("test-utils/compare.js")(__dirname);

describe("/processor.js", function() {
    describe("Methods", function() {
        beforeEach(function() {
            this.processor = new Processor({
                namer : (file, selector) => selector
            });
        });

        describe(".string()", function() {
            it("should process a string", function() {
                return this.processor.string("./packages/core/test/specimens/simple.css", ".wooga { }").then(function(result) {
                    var file = result.files[path.resolve("./packages/core/test/specimens/simple.css")];
                
                    expect(result.exports).toEqual({
                        wooga : [ "wooga" ]
                    });
                    
                    assert.equal(typeof file, "object");
                    
                    expect(file.exports, {
                        wooga : [ "wooga" ]
                    });
                    
                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.processed.root.toResult().css, ".wooga { }");
                });
            });
        });
        
        describe(".file()", function() {
            it("should process a file", function() {
                return this.processor.file("./packages/core/test/specimens/simple.css").then(function(result) {
                    var file = result.files[path.resolve("./packages/core/test/specimens/simple.css")];
                    
                    expect(result.exports).toEqual({
                        wooga : [ "wooga" ]
                    });
                    
                    assert.equal(typeof file, "object");
                    
                    expect(file.exports, {
                        wooga : [ "wooga" ]
                    });
                    
                    assert.equal(file.text, ".wooga { color: red; }\n");
                    assert.equal(file.processed.root.toResult().css, ".wooga { color: red; }\n");
                });
            });
        });
        
        describe(".remove()", function() {
            it("should remove a file", function() {
                var processor = this.processor;

                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then(() => {
                    processor.remove(path.resolve("./packages/core/test/specimens/simple.css"));
                    
                    expect(processor.dependencies(), []);
                });
            });
            
            it("should remove multiple files", function() {
                var processor = this.processor;
                
                return Promise.all([
                    processor.string("./packages/core/test/specimens/a.css", ".aooga { }"),
                    processor.string("./packages/core/test/specimens/b.css", ".booga { }"),
                    processor.string("./packages/core/test/specimens/c.css", ".cooga { }")
                ])
                .then(() => {
                    processor.remove([
                        path.resolve("./packages/core/test/specimens/a.css"),
                        path.resolve("./packages/core/test/specimens/b.css")
                    ]);
                    
                    expect(processor.dependencies(), [
                        path.resolve("./packages/core/test/specimens/c.css")
                    ]);
                });
            });
        });
        
        describe(".dependencies()", function() {
            it("should return the dependencies of the specified file", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => expect(
                    processor.dependencies(path.resolve("./packages/core/test/specimens/start.css")),
                    [
                        path.resolve("./packages/core/test/specimens/folder/folder.css"),
                        path.resolve("./packages/core/test/specimens/local.css")
                    ]
                ));
            });
            
            it("should return the overall order of dependencies if no file is specified", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => expect(processor.dependencies(), [
                    path.resolve("./packages/core/test/specimens/folder/folder.css"),
                    path.resolve("./packages/core/test/specimens/local.css"),
                    path.resolve("./packages/core/test/specimens/start.css")
                ]));
            });
        });
        
        describe(".output()", function() {
            it("should return a postcss result", function() {
                var processor = this.processor;

                return processor.file("./packages/core/test/specimens/start.css").then(function() {
                    return processor.output();
                })
                .then(function(result) {
                    compare.stringToFile(result.css, "./packages/core/test/results/processor/start.css");
                });
            });
            
            it("should generate css representing the output from all added files", function() {
                var processor = this.processor;

                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/simple.css")
                ])
                .then(() => processor.output())
                .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/processor/output-all.css"));
            });

            it("should avoid duplicating files in the output", function() {
                var processor = this.processor;

                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css")
                ])
                .then(() => processor.output())
                .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/processor/avoid-duplicates.css"));
            });
            
            it("should generate a JSON structure of all the compositions", function() {
                var processor = this.processor;

                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output())
                .then((result) => {
                    assert("compositions" in result);
                    assert.equal(typeof result.compositions, "object");
                    
                    expect(
                        result.compositions,
                        {
                            "packages/core/test/specimens/folder/folder.css" : {
                                folder : "folder"
                            },
                            
                            "packages/core/test/specimens/local.css" : {
                                booga : "booga",
                                looga : "booga looga"
                            },
                            
                            "packages/core/test/specimens/start.css" : {
                                booga : "booga",
                                tooga : "tooga",
                                wooga : "booga wooga"
                            }
                        }
                    );
                });
            });
            
            it("should order output by dependencies, then alphabetically", function() {
                var processor = this.processor;
                
                return Promise.all([
                    processor.file("./packages/core/test/specimens/start.css"),
                    processor.file("./packages/core/test/specimens/local.css"),
                    processor.file("./packages/core/test/specimens/composes.css"),
                    processor.file("./packages/core/test/specimens/deep.css")
                ])
                .then(() => processor.output())
                .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/processor/sorting.css"));
            });
        });

        describe("._resolve()", function() {
            it("should run resolvers until a match is found", function() {
                var ran = false,

                    processor = new Processor({
                        resolvers : [
                            () => {
                                ran = true;
                            },
                            (src, file) => {
                                return path.resolve(path.dirname(src), file);
                            }
                        ]
                    });
                
                assert.equal(
                    processor._resolve(
                        require.resolve("./specimens/simple.css"),
                        "./local.css"
                    ),
                    require.resolve("./specimens/local.css")
                );

                assert(ran);
            });

            it("should fall back to a default resolver", function() {
                var processor = new Processor({
                        resolvers : [
                            () => {}
                        ]
                    });
                
                assert.equal(
                    processor._resolve(
                        require.resolve("./specimens/simple.css"),
                        "./local.css"
                    ),
                    require.resolve("./specimens/local.css")
                );
            });
        });
    });
});
