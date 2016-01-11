"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    Processor = require("../src/processor");

describe("postcss-modular-css", function() {
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
                    it("should pass prefix through to the plugins", function() {
                        var processor = new Processor({ prefix : "googa" }),
                            result    = processor.string("./test/specimens/simple.css", ".wooga { }"),
                            file      = result.files["test/specimens/simple.css"];
                        
                        assert.deepEqual(result.exports, {
                            wooga : "googa_wooga"
                        });

                        assert.equal(typeof file, "object");

                        assert.deepEqual(file.compositions, {
                            wooga : [ "googa_wooga" ]
                        });

                        assert.equal(file.text, ".wooga { }");
                        assert.equal(file.parsed.root.toResult().css, ".googa_wooga { }");
                    });
                });
                
                describe("namer", function() {
                    it("should pass a namer function through to the plugins", function() {
                        var processor = new Processor({
                                namer : function(filename, selector) {
                                    return filename + selector;
                                }
                            }),
                            result = processor.string("./test/specimens/simple.css", ".wooga { }"),
                            file      = result.files["test/specimens/simple.css"];
                        
                        assert.deepEqual(result.exports, {
                            wooga : "test/specimens/simple.csswooga"
                        });

                        assert.equal(typeof file, "object");

                        assert.deepEqual(file.compositions, {
                            wooga : [ "test/specimens/simple.csswooga" ]
                        });

                        assert.equal(file.text, ".wooga { }");
                        assert.equal(file.parsed.root.toResult().css, ".test/specimens/simple.csswooga { }");
                    });
                });

                describe("before", function() {
                    it("should run postcss plugins before processing further", function() {
                        var processor = new Processor({
                                before : [ require("postcss-color-rebeccapurple") ]
                            });
                        
                        processor._walk("test/specimens/rebeccapurple.css", ".wooga { color: rebeccapurple }");
                        
                        assert.equal(
                            processor._files["test/specimens/rebeccapurple.css"].parsed.css,
                            ".wooga { color: rgb(102, 51, 153) }"
                        );
                    });
                });
                
                describe("after", function() {
                    it("should run postcss plugins after processing", function() {
                        var processor = new Processor({
                                after : [ require("postcss-color-rebeccapurple") ]
                            });
                        
                        processor.string("test/specimens/rebeccapurple.css", ".wooga { color: rebeccapurple }");
                        
                        assert.equal(
                            processor.css(),
                            "/* test/specimens/rebeccapurple.css */\n" +
                            ".mc8a0b0c62_wooga {\n" +
                            "    color: rgb(102, 51, 153)\n" +
                            "}"
                        );
                    });
                });
            });

            describe(".string", function() {
                it("should process a string", function() {
                    var result = this.processor.string("./test/specimens/simple.css", ".wooga { }"),
                        file   = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        wooga : "mc08e91a5b_wooga"
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "mc08e91a5b_wooga" ]
                    });

                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.parsed.root.toResult().css, ".mc08e91a5b_wooga { }");
                });
            });

            describe(".file", function() {
                it("should process a file", function() {
                    var result = this.processor.file("./test/specimens/simple.css"),
                        file   = result.files["test/specimens/simple.css"];
                    
                    assert.deepEqual(result.exports, {
                        wooga : "mc08e91a5b_wooga"
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.compositions, {
                        wooga : [ "mc08e91a5b_wooga" ]
                    });

                    assert.equal(file.text, ".wooga { color: red; }\n");
                    assert.equal(file.parsed.root.toResult().css, ".mc08e91a5b_wooga { color: red; }\n");
                });
            });
            
            describe(".remove", function() {
                it("should remove a file", function() {
                    this.processor.string("./test/specimens/simple.css", ".wooga { }");
                    
                    this.processor.remove("./test/specimens/simple.css");
                    
                    assert.deepEqual(this.processor.dependencies(), []);
                });
                
                it("should remove multiple files", function() {
                    this.processor.string("./test/specimens/a.css", ".aooga { }");
                    this.processor.string("./test/specimens/b.css", ".booga { }");
                    this.processor.string("./test/specimens/c.css", ".cooga { }");
                    
                    this.processor.remove([
                        "./test/specimens/a.css",
                        "./test/specimens/b.css"
                    ]);
                    
                    assert.deepEqual(this.processor.dependencies(), [
                        "test/specimens/c.css"
                    ]);
                });
            });
            
            describe("dependencies", function() {
                it("should return the dependencies of the specified file", function() {
                    this.processor.file("./test/specimens/start.css");
                    
                    assert.deepEqual(this.processor.dependencies("test/specimens/start.css"), [
                        "test/specimens/folder/folder.css",
                        "test/specimens/local.css"
                    ]);
                });
                
                it("should return the overall order of dependencies if no file is specified", function() {
                    this.processor.file("./test/specimens/start.css");
                    
                    assert.deepEqual(this.processor.dependencies(), [
                        "test/specimens/folder/folder.css",
                        "test/specimens/local.css",
                        "test/specimens/start.css"
                    ]);
                });
            });
            
            it("should export an object of space-separated strings", function() {
                var result = this.processor.string(
                        "./test/specimens/simple.css",
                        ".fooga { color: red; } .booga { background: #000; } .tooga { composes: fooga, booga; }"
                    );

                assert.deepEqual(result.exports, {
                    fooga : "mc08e91a5b_fooga",
                    booga : "mc08e91a5b_booga",
                    tooga : "mc08e91a5b_fooga mc08e91a5b_booga"
                });
            });

            it("should scope classes, ids, and keyframes", function() {
                    var result = this.processor.string("./test/specimens/simple.css", "@keyframes kooga { } #fooga { } .wooga { }"),
                        file   = result.files["test/specimens/simple.css"];
                    
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
                        file.parsed.root.toResult().css,
                        "@keyframes mc08e91a5b_kooga { } " +
                        "#mc08e91a5b_fooga { } " +
                        ".mc08e91a5b_wooga { }"
                    );
                });

            it("should walk dependencies into node_modules", function() {
                var result = this.processor.file("./test/specimens/node_modules.css"),
                    file;
                
                assert.deepEqual(result.exports, {
                    booga : "mc1fad4cc3_wooga",
                    wooga : "mc1fad4cc3_wooga"
                });

                file = result.files["test/specimens/node_modules.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/node_modules.css", "utf8"));
                assert.equal(file.parsed.root.toResult().css, "\n");

                assert.deepEqual(file.compositions, {
                    booga : [ "mc1fad4cc3_wooga" ],
                    wooga : [ "mc1fad4cc3_wooga" ]
                });

                file = result.files["test/specimens/node_modules/styles/styles.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/node_modules/styles/styles.css", "utf8"));
                assert.equal(file.parsed.root.toResult().css, ".mc1fad4cc3_wooga { color: white; }\n");

                assert.deepEqual(file.compositions, {
                    wooga : [ "mc1fad4cc3_wooga" ]
                });
            });

            it("should export identifiers and their classes", function() {
                var result = this.processor.file("./test/specimens/start.css"),
                    file;
                
                assert.deepEqual(result.exports, {
                    wooga : "mc04cb4cb2_booga",
                    booga : "mc61f0515a_booga",
                    tooga : "mc61f0515a_tooga"
                });

                file = result.files["test/specimens/start.css"];

                assert.equal(file.text, fs.readFileSync("./test/specimens/start.css", "utf8"));
                assert.equal(
                    file.parsed.root.toResult().css,
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
                assert.equal(file.parsed.root.toResult().css, ".mc04cb4cb2_booga { background: green; }\n");

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
                assert.equal(file.parsed.root.toResult().css, ".mc04bb002b_folder { margin: 2px; }\n");

                assert.deepEqual(file.values, {
                    folder : "white"
                });
                
                assert.deepEqual(file.compositions, {
                    folder : [ "mc04bb002b_folder" ]
                });
            });

            describe(".css()", function() {
                it("should generate css representing the output from all added files", function() {
                    this.processor.file("./test/specimens/start.css");
                    this.processor.file("./test/specimens/node_modules.css");
                    
                    assert.equal(
                        this.processor.css() + "\n",
                        fs.readFileSync("./test/results/processor-output-all.css", "utf8")
                    );
                });

                it("should avoid duplicating files in the output", function() {
                    this.processor.file("./test/specimens/start.css");
                    this.processor.file("./test/specimens/local.css");
                    
                    assert.equal(
                        this.processor.css() + "\n",
                        fs.readFileSync("./test/results/processor-avoid-duplicates.css", "utf8")
                    );
                });

                it("should have rewritten relative URLs based on the `to` option", function() {
                    this.processor.file("./test/specimens/relative.css");
                    
                    assert.equal(
                        this.processor.css({ to : "./test/output/relative.css" }) + "\n",
                        fs.readFileSync("./test/results/processor-relative.css", "utf8")
                    );
                });
            });
            
            describe("bad imports", function() {
                it("should fail if a value imports a non-existant reference", function() {
                    var processor = this.processor;
                    
                    assert.throws(function() {
                        processor.string("./invalid/value.css", "@value not-real from \"../local.css\";");
                    });
                });
                
                it("should fail if a composition imports a non-existant reference", function() {
                    var processor = this.processor;
                    
                    assert.throws(function() {
                        processor.string("./invalid/composition.css", ".wooga { composes: fake from \"../local.css\"; }");
                    });
                });
            });
        });
    });
});
