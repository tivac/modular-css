"use strict";

var fs     = require("fs"),
    assert = require("assert"),

    Promise = require("../src/_promise"),

    Processor = require("../src/processor");

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

describe("modular-css", function() {
    describe("processor", function() {
        describe("Basic functionality", function() {
            it("should be a function", function() {
                assert.equal(typeof Processor, "function");
            });
            
            it("should auto-instantiate if called without new", function() {
                /* eslint new-cap:0 */
                assert(Processor() instanceof Processor);
            });
        });

        describe("Functionality", function() {
            beforeEach(function() {
                this.processor = new Processor();
            });
            
            describe("options", function() {
                describe("prefix", function() {
                    it("should pass prefix through to the plugins", function(done) {
                        var processor = new Processor({ prefix : "googa" });
                        
                        processor.string("./test/specimens/simple.css", ".wooga { }").then(function(result) {
                            var file = result.files["test/specimens/simple.css"];
                        
                            assert.deepEqual(result.exports, {
                                wooga : "googa_wooga"
                            });

                            assert.equal(typeof file, "object");

                            assert.deepEqual(file.compositions, {
                                wooga : [ "googa_wooga" ]
                            });

                            assert.equal(file.text, ".wooga { }");
                            assert.equal(file.after.root.toResult().css, ".googa_wooga { }");

                            done();
                        })
                        .catch(done);
                    });
                });
                
                describe("namer", function() {
                    it("should pass a namer function through to the plugins", function(done) {
                        var processor = new Processor({
                                namer : function(filename, selector) {
                                    return filename + selector;
                                }
                            });
                            
                        processor.string("./test/specimens/simple.css", ".wooga { }").then(function(result) {
                            var file = result.files["test/specimens/simple.css"];
                        
                            assert.deepEqual(result.exports, {
                                wooga : "test/specimens/simple.csswooga"
                            });

                            assert.equal(typeof file, "object");

                            assert.deepEqual(file.compositions, {
                                wooga : [ "test/specimens/simple.csswooga" ]
                            });

                            assert.equal(file.text, ".wooga { }");
                            assert.equal(file.after.root.toResult().css, ".test/specimens/simple.csswooga { }");

                            done();
                        })
                        .catch(done);
                    });
                });

                describe("before", function() {
                    it("should run sync postcss plugins before processing", function(done) {
                        var processor = new Processor({
                                before : [ sync ]
                            });
                        
                        processor.string("test/specimens/sync-before.css", "").then(function() {
                            assert.equal(processor.css(),
                                "/* test/specimens/sync-before.css */\n" +
                                "a {}"
                            );
                            
                            done();
                        })
                        .catch(done);
                    });

                    it("should run async postcss plugins before processing", function(done) {
                        var processor = new Processor({
                                before : [ async ]
                            });
                        
                        processor.string("test/specimens/async-before.css", "").then(function() {
                            assert.equal(
                                processor.css(),
                                "/* test/specimens/async-before.css */\n" +
                                "a {}"
                            );
                            
                            done();
                        })
                        .catch(done);
                    });
                });
                
                describe("after", function() {
                    it("should run sync postcss plugins after processing", function(done) {
                        var processor = new Processor({
                                after : [ sync ]
                            });
                        
                        processor.string("test/specimens/sync-after.css", "").then(function() {
                            assert.equal(processor.css(),
                                "/* test/specimens/sync-after.css */\n" +
                                "a {}"
                            );
                            
                            done();
                        })
                        .catch(done);
                    });

                    it("should run async postcss plugins after processing", function(done) {
                        var processor = new Processor({
                                after : [ async ]
                            });
                        
                        processor.string("test/specimens/async-after.css", "").then(function() {
                            assert.equal(
                                processor.css(),
                                "/* test/specimens/async-after.css */\n" +
                                "a {}"
                            );
                            
                            done();
                        })
                        .catch(done);
                    });
                });
            });

            describe(".string", function() {
                it("should process a string", function(done) {
                    this.processor.string("./test/specimens/simple.css", ".wooga { }").then(function(result) {
                        var file = result.files["test/specimens/simple.css"];
                    
                        assert.deepEqual(result.exports, {
                            wooga : "mc08e91a5b_wooga"
                        });

                        assert.equal(typeof file, "object");

                        assert.deepEqual(file.compositions, {
                            wooga : [ "mc08e91a5b_wooga" ]
                        });

                        assert.equal(file.text, ".wooga { }");
                        assert.equal(file.after.root.toResult().css, ".mc08e91a5b_wooga { }");

                        done();
                    })
                    .catch(done);
                });
            });

            describe(".file", function(done) {
                it("should process a file", function() {
                    this.processor.file("./test/specimens/simple.css").then(function(result) {
                        var file = result.files["test/specimens/simple.css"];
                    
                        assert.deepEqual(result.exports, {
                            wooga : "mc08e91a5b_wooga"
                        });

                        assert.equal(typeof file, "object");

                        assert.deepEqual(file.compositions, {
                            wooga : [ "mc08e91a5b_wooga" ]
                        });

                        assert.equal(file.text, ".wooga { color: red; }\n");
                        assert.equal(file.after.root.toResult().css, ".mc08e91a5b_wooga { color: red; }\n");

                        done();
                    })
                    .catch(done);
                });
            });
            
            describe(".remove", function() {
                it("should remove a file", function(done) {
                    var processor = this.processor;

                    processor.string("./test/specimens/simple.css", ".wooga { }").then(function() {
                        processor.remove("./test/specimens/simple.css");
                        
                        assert.deepEqual(processor.dependencies(), []);
                        
                        done();
                    })
                    .catch(done);
                });
                
                it("should remove multiple files", function(done) {
                    var processor = this.processor;

                    processor.string("./test/specimens/a.css", ".aooga { }")
                    .then(function() {
                        return processor.string("./test/specimens/b.css", ".booga { }");
                    })
                    .then(function() {
                        return processor.string("./test/specimens/c.css", ".cooga { }");
                    })
                    .then(function() {
                        processor.remove([
                            "./test/specimens/a.css",
                            "./test/specimens/b.css"
                        ]);
                        
                        assert.deepEqual(processor.dependencies(), [
                            "test/specimens/c.css"
                        ]);

                        done();
                    })
                    .catch(done);
                });
            });
            
            describe("dependencies", function() {
                it("should return the dependencies of the specified file", function(done) {
                    var processor = this.processor;

                    processor.file("./test/specimens/start.css")
                    .then(function() {
                        assert.deepEqual(processor.dependencies("test/specimens/start.css"), [
                            "test/specimens/folder/folder.css",
                            "test/specimens/local.css"
                        ]);

                        done();
                    })
                    .catch(done);
                });
                
                it("should return the overall order of dependencies if no file is specified", function(done) {
                    var processor = this.processor;

                    processor.file("./test/specimens/start.css")
                    .then(function() {
                        assert.deepEqual(processor.dependencies(), [
                            "test/specimens/folder/folder.css",
                            "test/specimens/local.css",
                            "test/specimens/start.css"
                        ]);
                        
                        done();
                    })
                    .catch(done);
                });
            });
            
            it("should export an object of space-separated strings", function(done) {
                this.processor.string(
                    "./test/specimens/simple.css",
                    ".fooga { color: red; } .booga { background: #000; } .tooga { composes: fooga, booga; }"
                ).then(function(result) {
                    assert.deepEqual(result.exports, {
                        fooga : "mc08e91a5b_fooga",
                        booga : "mc08e91a5b_booga",
                        tooga : "mc08e91a5b_fooga mc08e91a5b_booga"
                    });
                    
                    done();
                })
                .catch(done);
            });

            it("should scope classes, ids, and keyframes", function(done) {
                this.processor.string(
                    "./test/specimens/simple.css",
                    "@keyframes kooga { } #fooga { } .wooga { }"
                ).then(function(result) {
                    var file = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        fooga : "mc08e91a5b_fooga",
                        kooga : "mc08e91a5b_kooga",
                        wooga : "mc08e91a5b_wooga"
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        fooga : [ "mc08e91a5b_fooga" ],
                        kooga : [ "mc08e91a5b_kooga" ],
                        wooga : [ "mc08e91a5b_wooga" ]
                    });

                    assert.equal(file.text, "@keyframes kooga { } #fooga { } .wooga { }");
                    assert.equal(
                        file.after.root.toResult().css,
                        "@keyframes mc08e91a5b_kooga { } " +
                        "#mc08e91a5b_fooga { } " +
                        ".mc08e91a5b_wooga { }"
                    );

                    done();
                })
                .catch(done);
            });

            it("should walk dependencies into node_modules", function(done) {
                this.processor.file("./test/specimens/node_modules.css").then(function(result) {
                    var file = result.files["test/specimens/node_modules.css"];
                    
                    assert.deepEqual(result.exports, {
                        booga : "mc1fad4cc3_wooga",
                        wooga : "mc1fad4cc3_wooga"
                    });

                    assert.equal(file.text, fs.readFileSync("./test/specimens/node_modules.css", "utf8"));
                    assert.equal(file.after.root.toResult().css, "\n");

                    assert.deepEqual(file.compositions, {
                        booga : [ "mc1fad4cc3_wooga" ],
                        wooga : [ "mc1fad4cc3_wooga" ]
                    });

                    file = result.files["test/specimens/node_modules/styles/styles.css"];

                    assert.equal(file.text, fs.readFileSync("./test/specimens/node_modules/styles/styles.css", "utf8"));
                    assert.equal(file.after.root.toResult().css, ".mc1fad4cc3_wooga { color: white; }\n");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "mc1fad4cc3_wooga" ]
                    });

                    done();
                })
                .catch(done);
            });

            it("should export identifiers and their classes", function(done) {
                this.processor.file("./test/specimens/start.css").then(function(result) {
                    var file = result.files["test/specimens/start.css"];
                
                    assert.deepEqual(result.exports, {
                        wooga : "mc04cb4cb2_booga",
                        booga : "mc61f0515a_booga",
                        tooga : "mc61f0515a_tooga"
                    });

                    assert.equal(file.text, fs.readFileSync("./test/specimens/start.css", "utf8"));
                    assert.equal(
                        file.after.root.toResult().css,
                        ".mc61f0515a_booga { color: red; background: blue; }\n" +
                        ".mc61f0515a_tooga { border: 1px solid white; }\n"
                    );

                    assert.deepEqual(file.values, {
                        folder : "white",
                        one    : "red",
                        two    : "blue"
                    });

                    assert.deepEqual(file.compositions, {
                        wooga : [ "mc04cb4cb2_booga" ],
                        booga : [ "mc61f0515a_booga" ],
                        tooga : [ "mc61f0515a_tooga" ]
                    });

                    file = result.files["test/specimens/local.css"];

                    assert.equal(file.text, fs.readFileSync("./test/specimens/local.css", "utf8"));
                    assert.equal(file.after.root.toResult().css, ".mc04cb4cb2_booga { background: green; }\n");

                    assert.deepEqual(file.values, {
                        folder : "white",
                        one    : "red",
                        two    : "blue"
                    });

                    assert.deepEqual(file.compositions, {
                        booga : [ "mc04cb4cb2_booga" ],
                        looga : [ "mc04cb4cb2_booga" ]
                    });

                    file = result.files["test/specimens/folder/folder.css"];

                    assert.equal(file.text, fs.readFileSync("./test/specimens/folder/folder.css", "utf8"));
                    assert.equal(file.after.root.toResult().css, ".mc04bb002b_folder { margin: 2px; }\n");

                    assert.deepEqual(file.values, {
                        folder : "white"
                    });
                    
                    assert.deepEqual(file.compositions, {
                        folder : [ "mc04bb002b_folder" ]
                    });

                    done();
                })
                .catch(done);
            });

            describe(".css()", function() {
                it("should generate css representing the output from all added files", function(done) {
                    var processor = this.processor;

                    processor.file("./test/specimens/start.css")
                    .then(function() {
                        return processor.file("./test/specimens/node_modules.css");
                    })
                    .then(function() {
                        assert.equal(
                            processor.css() + "\n",
                            fs.readFileSync("./test/results/processor/output-all.css", "utf8")
                        );

                        done();
                    })
                    .catch(done);
                });

                it("should avoid duplicating files in the output", function(done) {
                    var processor = this.processor;

                    processor.file("./test/specimens/start.css")
                    .then(function() {
                        return processor.file("./test/specimens/local.css");
                    })
                    .then(function() {
                        assert.equal(
                            processor.css() + "\n",
                            fs.readFileSync("./test/results/processor/avoid-duplicates.css", "utf8")
                        );

                        done();
                    })
                    .catch(done);
                });

                it("should have rewritten relative URLs based on the `to` option", function(done) {
                    var processor = this.processor;

                    processor.file("./test/specimens/relative.css")
                    .then(function() {
                        assert.equal(
                            processor.css({ to : "./test/output/relative.css" }) + "\n",
                            fs.readFileSync("./test/results/processor/relative.css", "utf8")
                        );

                        done();
                    })
                    .catch(done);
                });
            });
            
            describe("bad imports", function() {
                it("should fail if a value imports a non-existant reference", function(done) {
                    this.processor.string(
                        "./invalid/value.css",
                        "@value not-real from \"../local.css\";"
                    ).catch(function(error) {
                        assert.equal(error.message, "Unable to locate \"../local.css\" from \"invalid\"");

                        done();
                    });
                });
                
                it("should fail if a composition imports a non-existant reference", function(done) {
                    this.processor.string(
                        "./invalid/composition.css",
                        ".wooga { composes: fake from \"../local.css\"; }"
                    ).catch(function(error) {
                        assert.equal(error.message, "Unable to locate \"../local.css\" from \"invalid\"");

                        done();
                    });
                });
            });
        });
    });
});
