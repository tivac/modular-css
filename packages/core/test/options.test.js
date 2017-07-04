"use strict";

var path = require("path"),

    dedent   = require("dedent"),
    namer    = require("test-utils/namer.js"),
    relative = require("test-utils/relative.js"),

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
    describe("options", function() {
        describe("cwd", function() {
            it("should use an absolute path", function() {
                var cwd       = path.resolve("./packages/core/test/specimens/folder"),
                    processor = new Processor({
                        cwd
                    });
                
                return processor.file(
                    "./folder.css"
                )
                .then((result) => {
                    expect(processor.options.cwd).toBe(cwd);
                    expect(result.file).toBe(require.resolve("./specimens/folder/folder.css"));
                });
            });

            it("should accept a relative path but make it absolute", function() {
                var cwd       = "./packages/core/test/specimens/folder",
                    processor = new Processor({
                        cwd
                    });
                
                return processor.file(
                    "./folder.css"
                )
                .then((result) => {
                    expect(processor.options.cwd).toBe(path.resolve(cwd));
                    expect(result.file).toBe(require.resolve("./specimens/folder/folder.css"));
                });
            });
        });

        describe("namer", function() {
            it("should use a custom naming function", function() {
                var processor = new Processor({
                        namer : (filename, selector) =>
                            `${relative([ filename ])[0]}_${selector}`
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

            it.skip("should generate external source maps", function() {
                var processor = new Processor({
                        namer,
                        map : {
                            internal : false
                        }
                    });
                
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output({ to : "out.css" }))
                .then((result) => expect(result.css).toMatchSnapshot());
            });
        });

        describe("exportGlobals", function() {
            it("should not export :global values when exportGlobals is false", function() {
                var processor = new Processor({
                        exportGlobals : false
                    });
                
                return processor.string(
                    "./exportGlobals.css",
                    dedent(`
                        :global(.a) {}
                        .b {}
                    `)
                )
                .then((result) => expect(result.exports).toMatchSnapshot());
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
                    var processor = new Processor();

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

                it("should work with cssnano (no preset)", () => {
                    var processor = new Processor({
                            namer,
                            done : [ require("cssnano") ]
                        });

                    return processor.file(
                        "./packages/core/test/specimens/local.css"
                    )
                    .then(() => processor.output({ to : "./packages/core/test/output/local.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });

                it("should work with cssnano (default preset)", () => {
                    var processor = new Processor({
                            namer,
                            done : [
                                require("cssnano")({
                                    preset : "default"
                                })
                            ]
                        });

                    return processor.file(
                        "./packages/core/test/specimens/local.css"
                    )
                    .then(() => processor.output({ to : "./packages/core/test/output/local.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
            });
        });
    });
});
