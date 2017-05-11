"use strict";

var namer = require("test-utils/namer.js"),

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
                var processor = new Processor({
                        namer : (filename, selector) => `${filename}${selector}`
                    });
                    
                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => {
                    expect(result.exports).toMatchSnapshot();
                    expect(result.details.text).toMatchSnapshot();
                    expect(result.details.exports).toMatchSnapshot();
                    expect(result.details.processed.root.toResult().css).toMatchSnapshot();
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
                .then((result) => expect(result.exports).toMatchSnapshot());
            });

            it("should use the default naming function if a non-function is passed", function() {
                var processor = new Processor({
                        namer : false
                    });
                    
                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => expect(result.exports).toMatchSnapshot());
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
                .then((result) => expect(result.css).toMatchSnapshot());
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
                    .then((result) => expect(result.css).toMatchSnapshot());
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
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
            });
            
            describe("after", function() {
                it("should use postcss-url by default", function() {
                    var processor = this.processor;

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({ to : "./packages/core/test/output/relative.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
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
                    .then((result) => expect(result.css).toMatchSnapshot());
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
                    .then((result) => expect(result.css).toMatchSnapshot());
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
                    .then((result) => expect(result.css).toMatchSnapshot());
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
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
            });
        });
    });
});
