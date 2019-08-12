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
            it("should use an absolute path", async () => {
                const cwd = path.resolve("./packages/processor/test/specimens/folder");

                const processor = new Processor({ cwd });

                const { file } = await processor.file("./folder.css");

                expect(processor.options.cwd).toBe(cwd);
                expect(file).toBe(require.resolve("./specimens/folder/folder.css"));
            });

            it("should accept a relative path but make it absolute", async () => {
                const cwd = "./packages/processor/test/specimens/folder";

                const processor = new Processor({ cwd });

                const { file } = await processor.file("./folder.css");

                expect(processor.options.cwd).toBe(path.resolve(cwd));
                expect(file).toBe(require.resolve("./specimens/folder/folder.css"));
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
            it("should generate source maps", async () => {
                const processor = new Processor({
                        namer,
                        map : true,
                    });

                await processor.file("./packages/processor/test/specimens/start.css");

                const { css } = await processor.output({
                    from : "packages/processor/test/specimens/rewrite.css",
                    to   : "out.css",
                });

                expect(css).toMatchSnapshot();
            });

            it("should generate external source maps", async () => {
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

                expect(css).toMatchSnapshot();
            });
        });

        describe("exportGlobals", () => {
            it("should not export :global values when exportGlobals is false", async () => {
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

                expect(exports).toMatchSnapshot();
            });
        });

        describe("rewrite", () => {
            it("should rewrite url() references by default", async () => {
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

                expect(css).toMatchSnapshot();
            });

            it("should not rewrite url() references when falsey", async () => {
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

                expect(css).toMatchSnapshot();
            });

            it("should pass through to postcss-url as config", async () => {
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

                expect(css).toMatchSnapshot();
            });
        });

        describe("postcss options", () => {
            it("should support custom parsers", async () => {
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

                expect(css).toMatchSnapshot();
            });
        });

        describe("lifecycle options", () => {
            describe("before", () => {
                it("should run sync postcss plugins before processing", async () => {
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

                    expect(css).toMatchSnapshot();
                });

                it("should run async postcss plugins before processing", async () => {
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

                    expect(css).toMatchSnapshot();
                });
            });

            describe("processing", () => {
                it("should run sync postcss plugins processing processing", async () => {
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

                    expect(css).toMatchSnapshot();
                });

                it("should run async postcss plugins processing processing", async () => {
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

                    expect(css).toMatchSnapshot();
                });

                it("should include exports from 'modular-css-export' modules", async () => {
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

                    const { exports } = await processor.string(
                        "packages/processor/test/specimens/async-processing.css",
                        ""
                    );

                    expect(exports).toMatchSnapshot();
                });
            });

            describe("after", () => {
                it("should use postcss-url by default", async () => {
                    const processor = new Processor();

                    await processor.file("./packages/processor/test/specimens/relative.css");

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    });

                    expect(css).toMatchSnapshot();
                });

                it("should run sync postcss plugins", async () => {
                    const processor = new Processor({
                        namer,
                        after : [ sync ],
                    });

                    await processor.file("./packages/processor/test/specimens/relative.css");

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    });

                    expect(css).toMatchSnapshot();
                });

                it("should run async postcss plugins", async () => {
                    const processor = new Processor({
                        namer,
                        after : [ async ],
                    });

                    await processor.file("./packages/processor/test/specimens/relative.css");

                    const { css } = await processor.output({
                        from : "packages/processor/test/specimens/rewrite.css",
                        to   : "./packages/processor/test/output/relative.css",
                    });

                    expect(css).toMatchSnapshot();
                });
            });

            describe("done", () => {
                it("should run sync postcss plugins done processing", async () => {
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

                    expect(css).toMatchSnapshot();
                });

                it("should run async postcss plugins done processing", async () => {
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

                    expect(css).toMatchSnapshot();
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

            describe("dupewarn", () => {
                // const fn = cased ? it.skip : it;

                it("should warn on potentially duplicate file paths", async () => {
                    const { logSnapshot } = logs("warn");

                    const processor = new Processor({
                        namer,
                    });

                    await processor.string("packages/processor/test/specimens/start.css", ".start { color: red; }");
                    await processor.string("packages/processor/test/specimens/START.css", ".start { color: red; }");

                    logSnapshot();
                });

                it("shouldn't warn if dupewarn is false", async () => {
                    const spy = jest.spyOn(global.console, "warn");

                    spy.mockImplementation(() => { /* NO-OP */ });

                    const processor = new Processor({
                        namer,
                        dupewarn : false,
                    });

                    await processor.string("packages/processor/test/specimens/start.css", ".start { color: red; }");
                    await processor.string("packages/processor/test/specimens/START.css", ".start { color: red; }");

                    expect(spy).not.toHaveBeenCalled();
                });
            });
        });
    });
});
