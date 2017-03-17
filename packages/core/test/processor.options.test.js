"use strict";

var path    = require("path"),
    assert  = require("assert"),
    
    dedent = require("dedent"),

    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),

    Processor = require("../processor.js");

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
        this.processor = new Processor({
            namer : namer
        });
    });
    
    describe("options", function() {
        describe("namer", function() {
            it("should use a custom naming function", function() {
                var id        = path.resolve("./packages/core/test/specimens/simple.css"),
                    processor = new Processor({
                        namer : (filename, selector) => `${filename}${selector}`
                    });
                    
                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => {
                    var file = result.files[id];
                
                    expect(result.exports).toEqual({
                        wooga : [ `${id}wooga` ]
                    });

                    assert.equal(typeof file, "object");

                    expect(file.exports, {
                        wooga : [ `${id}wooga` ]
                    });

                    assert.equal(file.text, ".wooga { }");
                    assert.equal(file.processed.root.toResult().css, `.${id}wooga { }`);
                });
            });

            it("should require a namer if a string is passed", function() {
                var processor = new Processor({
                        namer : "modular-css-namer"
                    });
                    
                return processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => assert.deepEqual(result.exports, {
                    wooga : [ "AA" ]
                }));
            });

            it("should use the default naming function if a non-function is passed", function() {
                var processor = new Processor({
                        namer : false
                    });
                    
                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => expect(result.exports).toEqual({
                    wooga : [ "mcb251c446_wooga" ]
                }));
            });
        });

        describe("map", function() {
            it("should generate source maps", function() {
                var processor = new Processor({
                        namer,
                        map : true
                    });
                
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output({ to : "out.css" }))
                .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/processor/source-map.css"));
            });
        });

        describe("lifecycle options", function() {
            describe("before", function() {
                it("should run sync postcss plugins before processing", function() {
                    var processor = new Processor({
                            namer,
                            before : [ sync ]
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/sync-before.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        dedent(`
                            /* packages/core/test/specimens/sync-before.css */
                            a {}
                        `)
                    ));
                });

                it("should run async postcss plugins before processing", function() {
                    var processor = new Processor({
                            namer,
                            before : [ async ]
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/async-before.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        dedent(`
                            /* packages/core/test/specimens/async-before.css */
                            a {}
                        `)
                    ));
                });
            });
            
            describe("after", function() {
                it("should use postcss-url by default", function() {
                    var processor = this.processor;

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./packages/core/test/output/relative.css" }))
                    .then((result) => compare.stringToFile(result.css, "./packages/core/test/results/processor/relative.css"));
                });
                
                it("should run sync postcss plugins", function() {
                    var processor = new Processor({
                            namer,
                            after : [ sync ]
                        });

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./packages/core/test/output/relative.css" }))
                    .then((result) => assert.equal(
                        result.css,
                        dedent(`
                            /* packages/core/test/specimens/relative.css */
                            .wooga {
                                color: red;
                                background: url("./folder/to.png")
                            }
                            a {}
                        `)
                    ));
                });
                
                it("should run async postcss plugins", function() {
                    var processor = new Processor({
                            namer,
                            after : [ async ]
                        });

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./packages/core/test/output/relative.css" }))
                    .then((result) => assert.equal(
                        result.css,
                        dedent(`
                            /* packages/core/test/specimens/relative.css */
                            .wooga {
                                color: red;
                                background: url("./folder/to.png")
                            }
                            a {}
                        `)
                    ));
                });
            });
            
            describe("done", function() {
                it("should run sync postcss plugins done processing", function() {
                    var processor = new Processor({
                            namer,
                            done : [ sync ]
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/sync-done.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        dedent(`
                            /* packages/core/test/specimens/sync-done.css */
                            a {}
                        `)
                    ));
                });
                
                it("should run async postcss plugins done processing", function() {
                    var processor = new Processor({
                            namer,
                            done : [ async ]
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/async-done.css",
                        ""
                    )
                    .then(() => processor.output())
                    .then((result) => assert.equal(
                        result.css,
                        dedent(`
                            /* packages/core/test/specimens/async-done.css */
                            a {}
                        `)
                    ));
                });
            });
        });
    });
});
