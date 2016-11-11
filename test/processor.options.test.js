"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    Processor = require("../src/processor"),
    
    compare = require("./lib/compare-files"),
    warn    = require("./lib/warn");

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

describe("/processor.js", function() {
    beforeEach(function() {
        this.processor = new Processor();
    });
    
    describe("options", function() {
        describe("namer", function() {
            it("should use a custom naming function", function() {
                var id        = path.resolve("./test/specimens/simple.css"),
                    processor = new Processor({
                        namer : (filename, selector) => `${filename}${selector}`
                    });
                    
                return processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => {
                    var file = result.files[id];
                
                    assert.deepEqual(result.exports, {
                        wooga : [ `${id}wooga` ]
                    });

                    assert.equal(typeof file, "object");

                    assert.deepEqual(file.exports, {
                        wooga : [ `${id}wooga` ]
                    });

                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.processed.root.toResult().css, `.${id}wooga { }`);
                });
            });

            it("should use the default naming function if a non-function is passed", function() {
                var id        = path.resolve("./test/specimens/simple.css"),
                    processor = new Processor({
                        namer : false
                    });
                    
                return processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => assert.deepEqual(result.exports, {
                    wooga : [ "mc08e91a5b_wooga" ]
                }));
            });
        });

        describe("map", function() {
            it("should generate source maps", function() {
                var processor = new Processor({ map : true });
                
                return processor.file(
                    "./test/specimens/start.css"
                )
                .then(() => processor.output({ to : "out.css" }))
                .then((result) => compare.stringToFile(result.css, "./test/results/processor/source-map.css"));
            });
        });

        describe("strict", function() {
            it("should treat plugin warnings as errors by default (before)", function() {
                var processor = new Processor({
                        before : [ warn ]
                    });
                
                return processor.string(
                    "./test/specimens/simple.css",
                    ".foo { color: red; }"
                )
                .then(() => processor.output())
                .then(() => assert.fail("Shouldn't have succeeded"))
                .catch((error) => assert(error));
            });
            
            it("should treat plugin warnings as errors by default (after)", function() {
                var processor = new Processor({
                        after : [ warn ]
                    });
                
                return processor.string(
                    "./test/specimens/simple.css",
                    ".foo { color: red; }"
                )
                .then(() => processor.output())
                .then(() => assert.fail("Shouldn't have succeeded"))
                .catch((error) => assert(error));
            });

            it("should treat plugin warnings as errors by default (done)", function() {
                var processor = new Processor({
                        done : [ warn ]
                    });
                
                return processor.string(
                    "./test/specimens/simple.css",
                    ".foo { color: red; }"
                )
                .then(() => processor.output())
                .then(() => assert.fail("Shouldn't have succeeded"))
                .catch((error) => assert(error));
            });

            it("should ignore warnings when disabled", function() {
                var processor = new Processor({
                        after  : [ warn ],
                        strict : false
                    });
                
                return processor.string(
                    "./test/specimens/simple.css",
                    ".foo { color: red; }"
                )
                .then(() => processor.output());
            });
        });

        describe("lifecycle options", function() {
            describe("before", function() {
                it("should run sync postcss plugins before processing", function() {
                    var processor = new Processor({
                            before : [ sync ]
                        });
                    
                    return processor.string(
                        "test/specimens/sync-before.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then(function(result) {
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
                    
                    return processor.string(
                        "test/specimens/async-before.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        "/* test/specimens/async-before.css */\n" +
                        "a {}"
                    ));
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

                    return processor.file(
                        "./test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./test/output/relative.css" }))
                    .then((result) => compare.stringToFile(result.css, "./test/results/processor/relative.css"));
                });
                
                it("should run sync postcss plugins", function() {
                    var processor = new Processor({
                            after : [ sync ]
                        });

                    return processor.file(
                        "./test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./test/output/relative.css" }))
                    .then((result) => assert.equal(
                        result.css,
                        css
                    ));
                });
                
                it("should run async postcss plugins", function() {
                    var processor = new Processor({
                            after : [ async ]
                        });

                    return processor.file(
                        "./test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./test/output/relative.css" }))
                    .then((result) => assert.equal(
                        result.css,
                        css
                    ));
                });
            });
            
            describe("done", function() {
                it("should run sync postcss plugins done processing", function() {
                    var processor = new Processor({
                            done : [ sync ]
                        });
                    
                    return processor.string(
                        "test/specimens/sync-done.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        "/* test/specimens/sync-done.css */\n" +
                        "a {}"
                    ));
                });
                
                it("should run async postcss plugins done processing", function() {
                    var processor = new Processor({
                            done : [ async ]
                        });
                    
                    return processor.string(
                        "test/specimens/async-done.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        "/* test/specimens/async-done.css */\n" +
                        "a {}"
                    ));
                });
            });
        });
    });
});
