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
    return new Promise((resolve) =>
        setTimeout(() => {
            sync(css);

            resolve();
        }, 0)
    );
}

describe("/processor.js", () => {
    describe("options", () => {
        describe("cwd", () => {
            it("should use an absolute path", () => {
                var cwd       = path.resolve("./packages/core/test/specimens/folder"),
                    processor = new Processor({
                        cwd,
                    });
                
                return processor.file(
                    "./folder.css"
                )
                .then((result) => {
                    expect(processor.options.cwd).toBe(cwd);
                    expect(result.file).toBe(require.resolve("./specimens/folder/folder.css"));
                });
            });

            it("should accept a relative path but make it absolute", () => {
                var cwd       = "./packages/core/test/specimens/folder",
                    processor = new Processor({
                        cwd,
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

        describe("namer", () => {
            it("should use a custom naming function", () => {
                var processor = new Processor({
                        namer : (filename, selector) =>
                            `${relative([ filename ])[0]}_${selector}`,
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

            it("should require a namer if a string is passed", () => {
                var processor = new Processor({
                        namer : "modular-css-namer",
                    });
                    
                return processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => expect(result.exports).toMatchSnapshot());
            });

            it("should use the default naming function if a non-function is passed", () => {
                var processor = new Processor({
                        namer : false,
                    });
                    
                return processor.string(
                    "./packages/core/test/specimens/simple.css",
                    ".wooga { }"
                )
                .then((result) => expect(result.exports).toMatchSnapshot());
            });
        });

        describe("map", () => {
            it("should generate source maps", () => {
                var processor = new Processor({
                        namer,
                        map : true,
                    });
                
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output({
                    from : "packages/core/test/specimens/rewrite.css",
                    to   : "out.css",
                }))
                .then((result) => expect(result.css).toMatchSnapshot());
            });

            it("should generate external source maps", () => {
                var processor = new Processor({
                        namer,
                        map : {
                            internal : false,
                        },
                    });
                
                return processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.output({
                    from : "packages/core/test/specimens/rewrite.css",
                    to   : "out.css",
                }))
                .then((result) => expect(result.css).toMatchSnapshot());
            });
        });

        describe("exportGlobals", () => {
            it("should not export :global values when exportGlobals is false", () => {
                var processor = new Processor({
                        exportGlobals : false,
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

        describe("rewrite", () => {
            it("should rewrite url() references by default", () => {
                var processor = new Processor();

                return processor.string(
                    "packages/core/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                )
                .then(() => processor.output({
                    from : "packages/core/test/specimens/rewrite.css",
                    to   : "./packages/core/test/output/rewrite.css",
                }))
                .then((result) => expect(result.css).toMatchSnapshot());
            });

            it("should not rewrite url() references when falsey", () => {
                var processor = new Processor({ rewrite : false });

                return processor.string(
                    "packages/core/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                )
                .then(() => processor.output({
                    from : "packages/core/test/specimens/rewrite.css",
                    to   : "./packages/core/test/output/rewrite.css",
                }))
                .then((result) => expect(result.css).toMatchSnapshot());
            });
            
            it("should pass through to postcss-url as config", () => {
                var processor = new Processor({
                    rewrite : {
                        url : "inline",
                    },
                });
                
                return processor.string(
                    "packages/core/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                )
                .then(() => processor.output({
                    from : "packages/core/test/specimens/rewrite.css",
                    to   : "./packages/core/test/output/rewrite.css",
                }))
                .then((result) => expect(result.css).toMatchSnapshot());
            });
        });

        describe("lifecycle options", () => {
            describe("before", () => {
                it("should run sync postcss plugins before processing", () => {
                    var processor = new Processor({
                            namer,
                            before : [ sync ],
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/sync-before.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/core/test/specimens/sync-before.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });

                it("should run async postcss plugins before processing", () => {
                    var processor = new Processor({
                            namer,
                            before : [ async ],
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/async-before.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/core/test/specimens/sync-before.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
            });

            describe("processing", () => {
                it("should run sync postcss plugins processing processing", () => {
                    var processor = new Processor({
                            namer,
                            processing : [ sync ],
                        });

                    return processor.string(
                        "packages/core/test/specimens/sync-processing.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/core/test/specimens/sync-processing.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });

                it("should run async postcss plugins processing processing", () => {
                    var processor = new Processor({
                            namer,
                            processing : [ async ],
                        });

                    return processor.string(
                        "packages/core/test/specimens/async-processing.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/core/test/specimens/sync-processing.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });

                it("should include exports from 'modular-css-export' modules", () => {
                    var processor = new Processor({
                            namer,
                            processing : [ (css, result) => {
                                result.messages.push({
                                    plugin  : "modular-css-exporter",
                                    exports : {
                                        a : true,
                                        b : false,
                                    },
                                });
                            } ],
                        });

                    return processor.string(
                        "packages/core/test/specimens/async-processing.css",
                        ""
                    )
                    .then((file) => expect(file.exports).toMatchSnapshot());
                });
            });
            
            describe("after", () => {
                it("should use postcss-url by default", () => {
                    var processor = new Processor();

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({
                        from : "packages/core/test/specimens/rewrite.css",
                        to   : "./packages/core/test/output/relative.css",
                    }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
                
                it("should run sync postcss plugins", () => {
                    var processor = new Processor({
                            namer,
                            after : [ sync ],
                        });

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({
                        from : "packages/core/test/specimens/rewrite.css",
                        to   : "./packages/core/test/output/relative.css",
                    }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
                
                it("should run async postcss plugins", () => {
                    var processor = new Processor({
                            namer,
                            after : [ async ],
                        });

                    return processor.file(
                        "./packages/core/test/specimens/relative.css"
                    )
                    .then(() => processor.output({
                        from : "packages/core/test/specimens/rewrite.css",
                        to   : "./packages/core/test/output/relative.css",
                    }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
            });
            
            describe("done", () => {
                it("should run sync postcss plugins done processing", () => {
                    var processor = new Processor({
                            namer,
                            done : [ sync ],
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/sync-done.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/core/test/specimens/sync-done.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
                
                it("should run async postcss plugins done processing", () => {
                    var processor = new Processor({
                            namer,
                            done : [ async ],
                        });
                    
                    return processor.string(
                        "packages/core/test/specimens/async-done.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/core/test/specimens/async-done.css" }))
                    .then((result) => expect(result.css).toMatchSnapshot());
                });
            });
        });
    });
});
