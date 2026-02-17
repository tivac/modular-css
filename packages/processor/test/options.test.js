const { describe, it } = require("node:test");
const path = require("path");

const dedent = require("dedent");
const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");
const { logSpy, logSpyCalls } = require("@modular-css/test-utils/logs.js");

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
            it("should use an absolute path", async (t) => {
                const cwd = path.resolve("./packages/processor/test/specimens/folder");

                const processor = new Processor({ cwd });

                const { id } = await processor.file("./folder.css");

                t.assert.strictEqual(processor.options.cwd, cwd);
                t.assert.strictEqual(id, require.resolve("./specimens/folder/folder.css"));
            });

            it("should accept a relative path but make it absolute", async (t) => {
                const cwd = "./packages/processor/test/specimens/folder";

                const processor = new Processor({ cwd });

                const { id } = await processor.file("./folder.css");

                t.assert.strictEqual(processor.options.cwd, path.resolve(cwd));
                t.assert.strictEqual(id, require.resolve("./specimens/folder/folder.css"));
            });
        });

        describe("namer", () => {
            it("should use a custom naming function", async (t) => {
                const processor = new Processor({
                    namer : (filename, selector) =>
                        `${relative([ filename ])[0].replace(/[/.]/g, "_")}_${selector}`,
                });

                const { exports : compositions, details } = await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );

                t.assert.snapshot(compositions);
                t.assert.snapshot(details.classes);
                t.assert.snapshot(details.processed.root.toResult().css);
            });

            it("should require a namer if a string is passed", async (t) => {
                const processor = new Processor({
                    namer : "@modular-css/shortnames",
                });

                const result = await processor.string(
                    "./test/specimens/simple.css",
                    ".wooga { }"
                );

                t.assert.snapshot(result.exports);
            });

            it("should use the default naming function if a non-function is passed", async (t) => {
                const processor = new Processor({
                    namer : false,
                });

                const result = await processor.string(
                    "./packages/processor/test/specimens/simple.css",
                    ".wooga { }"
                );

                t.assert.snapshot(result.exports);
            });
        });

        describe("map", () => {
            it("should generate source maps", async (t) => {
                const processor = new Processor({
                    namer,
                    map : true,
                });

                await processor.file("./packages/processor/test/specimens/start.css");

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "out.css",
                });

                t.assert.snapshot(css);
            });

            it("should generate external source maps", async (t) => {
                const processor = new Processor({
                    namer,
                    map : {
                        internal : false,
                    },
                });

                await processor.file("./packages/processor/test/specimens/start.css");

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "out.css",
                });

                t.assert.snapshot(css);
            });
        });

        describe("exportGlobals", () => {
            it("should export :global values by default", async (t) => {
                const processor = new Processor({
                    exportGlobals : false,
                });

                const { exports } = await processor.string(
                    "./exportGlobals.css",
                    dedent(`
                        :global(.a) {}
                        .b {}
                    `)
                );

                t.assert.snapshot(exports);
            });
            
            it("should not export :global values when exportGlobals is false", async (t) => {
                const processor = new Processor({
                    exportGlobals : false,
                });

                const { exports } = await processor.string(
                    "./exportGlobals.css",
                    dedent(`
                        :global(.a) {}
                        .b {}
                    `)
                );

                t.assert.snapshot(exports);
            });
        });

        describe("rewrite", () => {
            it("should rewrite url() references by default", async (t) => {
                const processor = new Processor();

                await processor.string(
                    "packages/processor/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                );

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "./packages/processor/test/output/rewrite.css",
                });

                t.assert.snapshot(css);
            });

            it("should not rewrite url() references when falsey", async (t) => {
                const processor = new Processor({ rewrite : false });

                await processor.string(
                    "packages/processor/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                );

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "./packages/processor/test/output/rewrite.css",
                });

                t.assert.snapshot(css);
            });

            it("should pass through to postcss-url as config", async (t) => {
                const processor = new Processor({
                    rewrite : {
                        url : "inline",
                    },
                });

                await processor.string(
                    "packages/processor/test/specimens/rewrite.css",
                    dedent(`
                        .a {
                            background: url("img.png");
                        }
                    `)
                );

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "./packages/processor/test/output/rewrite.css",
                });

                t.assert.snapshot(css);
            });
        });

        describe("postcss options", () => {
            it("should support custom parsers", async (t) => {
                const parser = require("sugarss");

                const processor = new Processor({
                    postcss : {
                        parser,
                    },
                });

                await processor.string(
                    "packages/processor/test/specimens/parser.css",
                    dedent(`
                        .a
                            color: blue
                    `)
                );

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/parser.css",
                    to   : "./packages/processor/test/output/parser.css",
                });

                t.assert.snapshot(css);
            });
        });

        describe("lifecycle options", () => {
            describe("before", () => {
                it("should run sync postcss plugins before processing", async (t) => {
                    const processor = new Processor({
                        namer,
                        before : [ sync ],
                    });

                    await processor.string(
                        "packages/processor/test/specimens/sync-before.css",
                        ""
                    );

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/sync-before.css",
                    });

                    t.assert.snapshot(css);
                });

                it("should run async postcss plugins before processing", async (t) => {
                    const processor = new Processor({
                        namer,
                        before : [ async ],
                    });

                    await processor.string(
                        "packages/processor/test/specimens/async-before.css",
                        ""
                    );

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/sync-before.css",
                    });

                    t.assert.snapshot(css);
                });
            });

            describe("processing", () => {
                it("should run sync postcss plugins processing processing", async (t) => {
                    const processor = new Processor({
                        namer,
                        processing : [ sync ],
                    });

                    await processor.string(
                        "packages/processor/test/specimens/sync-processing.css",
                        ""
                    );

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/sync-processing.css",
                    });

                    t.assert.snapshot(css);
                });

                it("should run async postcss plugins processing processing", async (t) => {
                    const processor = new Processor({
                        namer,
                        processing : [ async ],
                    });

                    await processor.string(
                        "packages/processor/test/specimens/async-processing.css",
                        ""
                    );

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/sync-processing.css",
                    });

                    t.assert.snapshot(css);
                });

                it("should include exports from 'modular-css-export' modules", async (t) => {
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

                    const { details } = await processor.string(
                        "packages/processor/test/specimens/async-processing.css",
                        ""
                    );

                    t.assert.snapshot(details.exported);
                });
            });

            describe("after", () => {
                it("should use postcss-url by default", async (t) => {
                    const processor = new Processor();

                    await processor.file("./packages/processor/test/specimens/relative.css");

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    });

                    t.assert.snapshot(css);
                });

                it("should run sync postcss plugins", async (t) => {
                    const processor = new Processor({
                        namer,
                        after : [ sync ],
                    });

                    await processor.file("./packages/processor/test/specimens/relative.css");

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    });

                    t.assert.snapshot(css);
                });

                it("should run async postcss plugins", async (t) => {
                    const processor = new Processor({
                        namer,
                        after : [ async ],
                    });

                    await processor.file("./packages/processor/test/specimens/relative.css");

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    });

                    t.assert.snapshot(css);
                });
            });

            describe("done", () => {
                it("should run sync postcss plugins done processing", async (t) => {
                    const processor = new Processor({
                        namer,
                        done : [ sync ],
                    });

                    await processor.string(
                        "packages/processor/test/specimens/sync-done.css",
                        ""
                    );

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/sync-done.css",
                    });

                    t.assert.snapshot(css);
                });

                it("should run async postcss plugins done processing", async (t) => {
                    const processor = new Processor({
                        namer,
                        done : [ async ],
                    });

                    await processor.string(
                        "packages/processor/test/specimens/async-done.css",
                        ""
                    );

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/async-done.css",
                    });

                    t.assert.snapshot(css);
                });
            });

            describe("verbose", () => {
                it("should output debugging messages when verbose mode is enabled", async (t) => {
                    const spy = logSpy();

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

                    t.assert.snapshot(logSpyCalls(spy));
                });
            });

            describe("dupewarn", () => {
                // const fn = cased ? it.skip : it;

                it("should warn on potentially duplicate file paths", async (t) => {
                    const spy = logSpy("warn");

                    const processor = new Processor({
                        namer,
                    });

                    await processor.string("packages/processor/test/specimens/start.css", ".start { color: red; }");
                    await processor.string("packages/processor/test/specimens/START.css", ".start { color: red; }");

                    t.assert.snapshot(logSpyCalls(spy));
                });

                it("shouldn't warn if dupewarn is false", async (t) => {
                    const spy = logSpy("warn");

                    const processor = new Processor({
                        namer,
                        dupewarn : false,
                    });

                    await processor.string("packages/processor/test/specimens/start.css", ".start { color: red; }");
                    await processor.string("packages/processor/test/specimens/START.css", ".start { color: red; }");

                    t.assert.strictEqual(spy.calls.length, 0);
                });
            });
        });
    });
});
