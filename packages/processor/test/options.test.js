"use strict";

const path = require("path");

const dedent   = require("dedent");
const namer    = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");
const logs     = require("@modular-css/test-utils/logs.js");

const Processor = require("../processor.js");

const sync = (css) => css.append({ selector : "a" });

const async = (css) => (
    new Promise((resolve) =>
        setTimeout(() => {
            sync(css);

            resolve();
        }, 0)
    )
);

describe("/processor.js", () => {
    describe("options", () => {
        describe("cwd", () => {
            it("should use an absolute path", () => {
                const cwd       = path.resolve("./packages/processor/test/specimens/folder");

                const processor = new Processor({
                    cwd,
                });

                return processor.file(
                    "./folder.css"
                )
                .then(({ file }) => {
                    expect(processor.options.cwd).toBe(cwd);
                    expect(file).toBe(require.resolve("./specimens/folder/folder.css"));
                });
            });

            it("should accept a relative path but make it absolute", () => {
                const cwd       = "./packages/processor/test/specimens/folder";

                const processor = new Processor({
                    cwd,
                });

                return processor.file(
                    "./folder.css"
                )
                .then(({ file }) => {
                    expect(processor.options.cwd).toBe(path.resolve(cwd));
                    expect(file).toBe(require.resolve("./specimens/folder/folder.css"));
                });
            });
        });

        describe("namer", () => {
            it("should use a custom naming function", async () => {
                const processor = new Processor({
                    namer : (filename, selector) =>
                        `${relative([ filename ])[0].replace(/[\/\.]/g, "_")}_${selector}`,
                });
                    
                const result = await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );

                expect(result.exports).toMatchSnapshot();
                expect(result.details.text).toMatchSnapshot();
                expect(result.details.exports).toMatchSnapshot();
                expect(result.details.processed.root.toResult().css).toMatchSnapshot();
            });

            it("should require a namer if a string is passed", async () => {
                const processor = new Processor({
                    namer : "@modular-css/shortnames",
                });
                    
                const result = await processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                );
                
                expect(result.exports).toMatchSnapshot();
            });

            it("should use the default naming function if a non-function is passed", async () => {
                const processor = new Processor({
                    namer : false,
                });
                    
                const result = await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );
                
                expect(result.exports).toMatchSnapshot();
            });
        });

        describe("map", () => {
            it("should generate source maps", () => {
                const processor = new Processor({
                        namer,
                        map : true,
                    });
                
                return processor.file(
                    "./packages/processor/test/specimens/start.css"
                )
                .then(() => processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "out.css",
                }))
                .then(({ css }) => expect(css).toMatchSnapshot());
            });

            it("should generate external source maps", () => {
                const processor = new Processor({
                        namer,
                        map : {
                            internal : false,
                        },
                    });
                
                return processor.file(
                    "./packages/processor/test/specimens/start.css"
                )
                .then(() => processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "out.css",
                }))
                .then(({ css }) => expect(css).toMatchSnapshot());
            });
        });

        describe("exportGlobals", () => {
            it("should not export :global values when exportGlobals is false", () => {
                const processor = new Processor({
                        exportGlobals : false,
                    });
                
                return processor.string(
                    "./exportGlobals.css",
                    dedent(`
                        :global(.a) {}
                        .b {}
                    `)
                )
                .then(({ exports }) => expect(exports).toMatchSnapshot());
            });
        });

        describe("rewrite", () => {
            it("should rewrite url() references by default", () => {
                const processor = new Processor();

                return processor.string(
                    "packages/processor/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                )
                .then(() => processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "./packages/processor/test/output/rewrite.css",
                }))
                .then(({ css }) => expect(css).toMatchSnapshot());
            });

            it("should not rewrite url() references when falsey", () => {
                const processor = new Processor({ rewrite : false });

                return processor.string(
                    "packages/processor/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                )
                .then(() => processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "./packages/processor/test/output/rewrite.css",
                }))
                .then(({ css }) => expect(css).toMatchSnapshot());
            });
            
            it("should pass through to postcss-url as config", () => {
                const processor = new Processor({
                    rewrite : {
                        url : "inline",
                    },
                });
                
                return processor.string(
                    "packages/processor/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                )
                .then(() => processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "./packages/processor/test/output/rewrite.css",
                }))
                .then(({ css }) => expect(css).toMatchSnapshot());
            });
        });

        describe("lifecycle options", () => {
            describe("before", () => {
                it("should run sync postcss plugins before processing", () => {
                    const processor = new Processor({
                            namer,
                            before : [ sync ],
                        });
                    
                    return processor.string(
                        "packages/processor/test/specimens/sync-before.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/processor/test/specimens/sync-before.css" }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });

                it("should run async postcss plugins before processing", () => {
                    const processor = new Processor({
                            namer,
                            before : [ async ],
                        });
                    
                    return processor.string(
                        "packages/processor/test/specimens/async-before.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/processor/test/specimens/sync-before.css" }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });
            });

            describe("processing", () => {
                it("should run sync postcss plugins processing processing", () => {
                    const processor = new Processor({
                            namer,
                            processing : [ sync ],
                        });

                    return processor.string(
                        "packages/processor/test/specimens/sync-processing.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/processor/test/specimens/sync-processing.css" }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });

                it("should run async postcss plugins processing processing", () => {
                    const processor = new Processor({
                            namer,
                            processing : [ async ],
                        });

                    return processor.string(
                        "packages/processor/test/specimens/async-processing.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/processor/test/specimens/sync-processing.css" }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });

                it("should include exports from 'modular-css-export' modules", () => {
                    const processor = new Processor({
                            namer,
                            processing : [ (css, { messages }) => {
                                messages.push({
                                    plugin  : "modular-css-exporter",
                                    exports : {
                                        a : true,
                                        b : false,
                                    },
                                });
                            } ],
                        });

                    return processor.string(
                        "packages/processor/test/specimens/async-processing.css",
                        ""
                    )
                    .then(({ exports }) => expect(exports).toMatchSnapshot());
                });
            });
            
            describe("after", () => {
                it("should use postcss-url by default", () => {
                    const processor = new Processor();

                    return processor.file(
                        "./packages/processor/test/specimens/relative.css"
                    )
                    .then(() => processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });
                
                it("should run sync postcss plugins", () => {
                    const processor = new Processor({
                            namer,
                            after : [ sync ],
                        });

                    return processor.file(
                        "./packages/processor/test/specimens/relative.css"
                    )
                    .then(() => processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });
                
                it("should run async postcss plugins", () => {
                    const processor = new Processor({
                            namer,
                            after : [ async ],
                        });

                    return processor.file(
                        "./packages/processor/test/specimens/relative.css"
                    )
                    .then(() => processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });
            });
            
            describe("done", () => {
                it("should run sync postcss plugins done processing", () => {
                    const processor = new Processor({
                            namer,
                            done : [ sync ],
                        });
                    
                    return processor.string(
                        "packages/processor/test/specimens/sync-done.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/processor/test/specimens/sync-done.css" }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });
                
                it("should run async postcss plugins done processing", () => {
                    const processor = new Processor({
                            namer,
                            done : [ async ],
                        });
                    
                    return processor.string(
                        "packages/processor/test/specimens/async-done.css",
                        ""
                    )
                    .then(() => processor.output({ from : "packages/processor/test/specimens/async-done.css" }))
                    .then(({ css }) => expect(css).toMatchSnapshot());
                });
            });

            describe("verbose", () => {
                it("should output debugging messages when verbose mode is enabled", async () => {
                    const { logSnapshot } = logs();

                    const processor = new Processor({
                        namer,
                        verbose : true,
                    });
                    
                    await processor.file("./packages/processor/test/specimens/start.css");
                    await processor.string(
                        "packages/processor/test/specimens/string.css",
                        ".foo { color: fuschia; }"
                    );

                    await processor.output();

                    logSnapshot();
                });
            });
        });
    });
});
