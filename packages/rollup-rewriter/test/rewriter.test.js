const { describe, it } = require("node:test");

const { rollup } = require("rollup");

const shell = require("shelljs");

const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer  = require("@modular-css/test-utils/namer.js");
const { logSpy, logSpyCalls }   = require("@modular-css/test-utils/logs.js");

const css = require("@modular-css/rollup");

const rewriter = require("../rewriter.js");
const { rollupBundle } = require("@modular-css/test-utils/rollup.js");

const assetFileNames = "assets/[name][extname]";
const chunkFileNames = "[name].js";
const map = false;
const sourcemap = false;

describe("rollup-rewriter", () => {
    shell.rm("-rf", prefix("./output/*"));

    it("should require a loadfn", async (t) => {
        await t.assert.rejects(async () => rewriter({}));
    });

    it("should error on unsupported formats (cjs)", async (t) => {
        const bundle = await rollup({
            input : [
                require.resolve("./specimens/dynamic-imports/a.js"),
                require.resolve("./specimens/dynamic-imports/b.js"),
            ],
            plugins : [
                css({
                    namer,
                    map,
                }),
                rewriter({
                    loadfn : "lazyload",
                }),
            ],
        });

        try {
            await bundle.generate({
                format : "cjs",
                sourcemap,

                assetFileNames,
                chunkFileNames,
                exports : "auto",
            });
        } catch(e) {
            t.assert.snapshot(e.toString());
        }
    });

    [ "amd", "es", "esm", "system" ].forEach((format) => {
        it(`shouldn't require a loader (${format})`, async (t) => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/dynamic-imports/a.js"),
                    require.resolve("./specimens/dynamic-imports/b.js"),
                ],
                plugins : [
                    css({
                        namer,
                        map,
                    }),
                    rewriter({
                        loadfn : "lazyload",
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        sourcemap,

                        assetFileNames,
                        chunkFileNames,
                        exports : "auto",
                    })
                )
            );
        });

        it(`should support loader & loadfn (${format})`, async (t) => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/dynamic-imports/a.js"),
                    require.resolve("./specimens/dynamic-imports/b.js"),
                ],
                plugins : [
                    css({
                        namer,
                        map,
                    }),
                    rewriter({
                        loader : `import lazyload from "./css.js";`,
                        loadfn : "lazyload",
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        sourcemap,

                        assetFileNames,
                        chunkFileNames,
                        exports : "auto",
                    })
                )
            );
        });

        it(`should support loader being a function (${format})`, async (t) => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/dynamic-imports/a.js"),
                    require.resolve("./specimens/dynamic-imports/b.js"),
                ],
                plugins : [
                    css({
                        namer,
                        map,
                    }),
                    rewriter({
                        loader : ({ chunks }) => `import chunkCountIs${Object.keys(chunks).length} from "./css.js";`,
                        loadfn : "lazyload",
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        sourcemap,

                        assetFileNames,
                        chunkFileNames,
                        exports : "auto",
                    })
                )
            );
        });

        it(`should only rewrite when necessary (${format})`, async (t) => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/no-asset-imports/a.js"),
                    require.resolve("./specimens/no-asset-imports/b.js"),
                ],
                plugins : [
                    css({
                        namer,
                        map,
                    }),
                    rewriter({
                        loadfn : "lazyload",
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        sourcemap,

                        assetFileNames,
                        chunkFileNames,
                        exports : "auto",
                    })
                )
            );
        });

        it(`should ignore unknown imports (${format})`, async (t) => {
            const bundle = await rollup({
                input    : require.resolve("./specimens/external-import/a.js"),
                external : [ "external" ],
                plugins  : [
                    css({
                        namer,
                        map,
                    }),
                    rewriter({
                        loadfn : "lazyload",
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        sourcemap,

                        assetFileNames,
                        chunkFileNames,
                        exports : "auto",
                    })
                )
            );
        });

        it(`should include css for static imports used by a dynamic import (${format})`, async (t) => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/dynamic-shared-imports/entry1.js"),
                    require.resolve("./specimens/dynamic-shared-imports/entry2.js"),
                ],
                plugins : [
                    css({
                        namer,
                        map,
                    }),
                    rewriter({
                        loadfn : "lazyload",
                    }),
                ],
            });

             t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        sourcemap,

                        assetFileNames,
                        chunkFileNames,
                        exports : "auto",
                    })
                )
            );
        });
    });
     
    it("should log details in verbose mode", async (t) => {
        const spy = logSpy();

        const bundle = await rollup({
            input : [
                require.resolve("./specimens/dynamic-imports/a.js"),
                require.resolve("./specimens/dynamic-imports/b.js"),
            ],
            plugins : [
                css({
                    namer,
                    map,
                }),
                rewriter({
                    loadfn  : "lazyload",
                    verbose : true,
                }),
            ],
        });

        await bundle.generate({
            format : "es",

            sourcemap,
            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        t.assert.snapshot(logSpyCalls(spy));
    });
});
