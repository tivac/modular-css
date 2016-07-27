"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    Promise   = require("../src/lib/promise"),
    Processor = require("../src/processor"),
    
    compare = require("./lib/compare-files");

// Catch unhandled promise rejections and fail the test
process.on("unhandledRejection", function(reason) {
    throw reason;
});

function sync(css) {
    css.append({ selector : "a" });
}

function async(css) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            sync(css);

            resolve();
        }, 0);
    });
}

function warn(css, result) {
    result.warn("warning");
}

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
        
        describe("options", function() {
            describe("namer", function() {
                it("should use a custom naming function", function() {
                    var id        = path.resolve("./test/specimens/simple.css"),
                        processor = new Processor({
                            namer : function(filename, selector) {
                                return filename + selector;
                            }
                        });
                        
                    return processor.string("./test/specimens/simple.css", ".wooga { }").then(function(result) {
                        var file = result.files[id];
                    
                        assert.deepEqual(result.exports, {
                            wooga : [ id + "wooga" ]
                        });

                        assert.equal(typeof file, "object");

                        assert.deepEqual(file.exports, {
                            wooga : [ id + "wooga" ]
                        });

                        assert.equal(file.text, ".wooga { }");
                        assert.equal(file.processed.root.toResult().css, "." + id + "wooga { }");
                    });
                });
            });

            describe("map", function() {
                it("should generate source maps", function() {
                    var processor = new Processor({ map : true });
                    
                    return processor.file("./test/specimens/start.css").then(function() {
                        return processor.output({ to : "out.css" });
                    })
                    .then(function(result) {
                        compare.stringToFile(result.css, "./test/results/processor/source-map.css");
                    });
                });
            });

            describe("strict", function() {
                it("should treat plugin warnings as errors by default (before)", function() {
                    var processor = new Processor({
                            before : [ warn ]
                        });
                    
                    return processor.string("./test/specimens/simple.css", ".foo { color: red; }").then(function() {
                        return processor.output();
                    })
                    .then(
                        function() {
                            assert.fail("Shouldn't have succeeded");
                        },
                        function(error) {
                            assert(error);
                        }
                    );
                });
                
                it("should treat plugin warnings as errors by default (after)", function() {
                    var processor = new Processor({
                            after : [ warn ]
                        });
                    
                    return processor.string("./test/specimens/simple.css", ".foo { color: red; }").then(function() {
                        return processor.output();
                    })
                    .then(
                        function() {
                            assert.fail("Shouldn't have succeeded");
                        },
                        function(error) {
                            assert(error);
                        }
                    );
                });

                it("should treat plugin warnings as errors by default (done)", function() {
                    var processor = new Processor({
                            done : [ warn ]
                        });
                    
                    return processor.string("./test/specimens/simple.css", ".foo { color: red; }").then(function() {
                        return processor.output();
                    })
                    .then(
                        function() {
                            assert.fail("Shouldn't have succeeded");
                        },
                        function(error) {
                            assert(error);
                        }
                    );
                });

                it("should ignore warnings when disabled", function() {
                    var processor = new Processor({
                            after  : [ warn ],
                            strict : false
                        });
                    
                    return processor.string("./test/specimens/simple.css", ".foo { color: red; }").then(function() {
                        return processor.output();
                    });
                });
            });

            describe("lifecycle options", function() {
                describe("before", function() {
                    it("should run sync postcss plugins before processing", function() {
                        var processor = new Processor({
                                before : [ sync ]
                            });
                        
                        return processor.string("test/specimens/sync-before.css", "").then(function() {
                            return processor.output();
                        }).then(function(result) {
                            assert.equal(
                                result.css,
                                "/* test/specimens/sync-before.css */\n" +
                                "a {}"
                            );
                        });
                    });

                    it("should run async postcss plugins before processing", function() {
                        var processor = new Processor({
                                before : [ async ]
                            });
                        
                        return processor.string("test/specimens/async-before.css", "").then(function() {
                            return processor.output();
                        })
                        .then(function(result) {
                            assert.equal(
                                result.css,
                                "/* test/specimens/async-before.css */\n" +
                                "a {}"
                            );
                        });
                    });
                });
                
                describe("after", function() {
                    var css =
                            "/* test/specimens/relative.css */\n" +
                            ".mc592b2d8f_wooga {\n" +
                            "    color: red;\n" +
                            "    background: url(\"./folder/to.png\")\n" +
                            "}\n" +
                            "a {}";
                    
                    it("should use postcss-url by default", function() {
                        var processor = this.processor;

                        return processor.file("./test/specimens/relative.css").then(function() {
                            return processor.output({ to : "./test/output/relative.css" });
                        })
                        .then(function(result) {
                            compare.stringToFile(result.css, "./test/results/processor/relative.css");
                        });
                    });
                    
                    it("should run sync postcss plugins", function() {
                        var processor = new Processor({
                                after : [ sync ]
                            });

                        return processor.file("./test/specimens/relative.css").then(function() {
                            return processor.output({ to : "./test/output/relative.css" });
                        })
                        .then(function(result) {
                            assert.equal(
                                result.css,
                                css
                            );
                        });
                    });
                    
                    it("should run async postcss plugins", function() {
                        var processor = new Processor({
                                after : [ async ]
                            });

                        return processor.file("./test/specimens/relative.css").then(function() {
                            return processor.output({ to : "./test/output/relative.css" });
                        })
                        .then(function(result) {
                            assert.equal(
                                result.css,
                                css
                            );
                        });
                    });
                });
                
                describe("done", function() {
                    it("should run sync postcss plugins done processing", function() {
                        var processor = new Processor({
                                done : [ sync ]
                            });
                        
                        return processor.string("test/specimens/sync-done.css", "").then(function() {
                            return processor.output();
                        }).then(function(result) {
                            assert.equal(
                                result.css,
                                "/* test/specimens/sync-done.css */\n" +
                                "a {}"
                            );
                        });
                    });
                    
                    it("should run async postcss plugins done processing", function() {
                        var processor = new Processor({
                                done : [ async ]
                            });
                        
                        return processor.string("test/specimens/async-done.css", "").then(function() {
                            return processor.output();
                        }).then(function(result) {
                            assert.equal(
                                result.css,
                                "/* test/specimens/async-done.css */\n" +
                                "a {}"
                            );
                        });
                    });
                });
            });
        });
        
        describe("Methods", function() {
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

                    return processor.string("./test/specimens/simple.css", ".wooga { }").then(function() {
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
                    .then(function() {
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

                    return processor.file("./test/specimens/start.css").then(function() {
                        assert.deepEqual(
                            processor.dependencies(path.resolve("./test/specimens/start.css")),
                            [
                                path.resolve("./test/specimens/folder/folder.css"),
                                path.resolve("./test/specimens/local.css")
                            ]
                        );
                    });
                });
                
                it("should return the overall order of dependencies if no file is specified", function() {
                    var processor = this.processor;

                    return processor.file("./test/specimens/start.css").then(function() {
                        assert.deepEqual(processor.dependencies(), [
                            path.resolve("./test/specimens/folder/folder.css"),
                            path.resolve("./test/specimens/local.css"),
                            path.resolve("./test/specimens/start.css")
                        ]);
                    });
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
                    .then(function() {
                        return processor.output();
                    })
                    .then(function(result) {
                        compare.stringToFile(result.css, "./test/results/processor/output-all.css");
                    });
                });

                it("should avoid duplicating files in the output", function() {
                    var processor = this.processor;

                    return Promise.all([
                        processor.file("./test/specimens/start.css"),
                        processor.file("./test/specimens/local.css")
                    ])
                    .then(function() {
                        return processor.output();
                    })
                    .then(function(result) {
                        compare.stringToFile(result.css, "./test/results/processor/avoid-duplicates.css");
                    });
                });
                
                it("should generate a JSON structure of all the compositions", function() {
                    var processor = this.processor;

                    return processor.file("./test/specimens/start.css").then(function() {
                        return processor.output();
                    })
                    .then(function(result) {
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
                    .then(function() {
                        return processor.output();
                    })
                    .then(function(result) {
                        compare.stringToFile(result.css, "./test/results/processor/sorting.css");
                    });
                });
            });
        });
        
        describe("getters", function() {
            beforeEach(function() {
                this.processor = new Processor();
            });
            
            describe(".file", function() {
                it("should return all the files that have been added", function() {
                    var processor = this.processor;
                    
                    return processor.file("./test/specimens/start.css").then(function() {
                        return processor.file("./test/specimens/local.css");
                    })
                    .then(function() {
                        assert.equal(typeof processor.files, "object");
                        
                        assert.equal(Object.keys(processor.files).length, 3);
                        
                        assert(path.resolve("./test/specimens/local.css") in processor.files);
                        assert(path.resolve("./test/specimens/start.css") in processor.files);
                        assert(path.resolve("./test/specimens/folder/folder.css") in processor.files);
                    });
                });
            });
        });
        
        it("should export an object of arrays containing strings", function() {
            return this.processor.string(
                "./test/specimens/simple.css",
                ".fooga { color: red; } .booga { background: #000; } .tooga { composes: fooga, booga; }"
            ).then(function(result) {
                assert.deepEqual(result.exports, {
                    fooga : [ "mc08e91a5b_fooga" ],
                    booga : [ "mc08e91a5b_booga" ],
                    tooga : [ "mc08e91a5b_fooga", "mc08e91a5b_booga", "mc08e91a5b_tooga" ]
                });
            });
        });

        it("should scope classes, ids, and keyframes", function() {
            return this.processor.string(
                "./test/specimens/simple.css",
                "@keyframes kooga { } #fooga { } .wooga { }"
            ).then(function(result) {
                var file = result.files[path.resolve("./test/specimens/simple.css")];
                
                assert.deepEqual(result.exports, {
                    fooga : [ "mc08e91a5b_fooga" ],
                    kooga : [ "mc08e91a5b_kooga" ],
                    wooga : [ "mc08e91a5b_wooga" ]
                });

                assert.equal(typeof file, "object");

                assert.deepEqual(file.exports, {
                    fooga : [ "mc08e91a5b_fooga" ],
                    kooga : [ "mc08e91a5b_kooga" ],
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

        it("should export identifiers and their classes", function() {
            return this.processor.file("./test/specimens/start.css").then(function(result) {
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

                assert.deepEqual(file.values, {
                    folder : "white",
                    one    : "red",
                    two    : "blue"
                });

                assert.deepEqual(file.exports, {
                    wooga : [ "mc04cb4cb2_booga", "mc61f0515a_wooga" ],
                    booga : [ "mc61f0515a_booga" ],
                    tooga : [ "mc61f0515a_tooga" ]
                });

                file = result.files[path.resolve("./test/specimens/local.css")];

                assert.equal(file.text, fs.readFileSync("./test/specimens/local.css", "utf8"));
                assert.equal(file.processed.root.toResult().css, ".mc04cb4cb2_booga { background: green; }\n");

                assert.deepEqual(file.values, {
                    folder : "white",
                    one    : "red",
                    two    : "blue"
                });

                assert.deepEqual(file.exports, {
                    booga : [ "mc04cb4cb2_booga" ],
                    looga : [ "mc04cb4cb2_booga", "mc04cb4cb2_looga" ]
                });

                file = result.files[path.resolve("./test/specimens/folder/folder.css")];

                assert.equal(file.text, fs.readFileSync("./test/specimens/folder/folder.css", "utf8"));
                assert.equal(file.processed.root.toResult().css, ".mc04bb002b_folder { margin: 2px; }\n");

                assert.deepEqual(file.values, {
                    folder : "white"
                });
                
                assert.deepEqual(file.exports, {
                    folder : [ "mc04bb002b_folder" ]
                });
            });
        });
        
        describe("bad imports", function() {
            var invalid = "Unable to locate \"../local.css\" from \"" + path.resolve("invalid") + "\"";
            
            it("should fail if a value imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/value.css",
                    "@value not-real from \"../local.css\";"
                ).catch(function(error) {
                    assert.equal(error.message, invalid);
                });
            });
            
            it("should fail if a composition imports a non-existant reference", function() {
                return this.processor.string(
                    "./invalid/composition.css",
                    ".wooga { composes: fake from \"../local.css\"; }"
                ).catch(function(error) {
                    assert.equal(error.message, invalid);
                });
            });
        });
    });
});
