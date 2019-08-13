/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const Processor = require("@modular-css/processor");

const namer = require("@modular-css/test-utils/namer.js");

const plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

const assetFileNames = "assets/[name][extname]";
const chunkFileNames = "[name].js";
const format = "es";
const map = false;
const sourcemap = false;
const json = true;

describe("/rollup.js", () => {
    describe("code splitting", () => {
        it("should support splitting up CSS files", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/simple.js"),
                    require.resolve("./specimens/dependencies.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should correctly chunk up CSS files", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/css-dependencies/a.js"),
                    require.resolve("./specimens/css-dependencies/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                        // verbose : true,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should support outputting metadata about CSS dependencies", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/metadata/a.js"),
                    require.resolve("./specimens/metadata/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                        meta : true,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should output metadata successfully when unreferenced CSS is output to common", async () => {
            const processor = new Processor();

            await processor.string("./fake.css", ".fake { color: red; }");

            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/metadata/a.js"),
                    require.resolve("./specimens/metadata/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                        processor,
                        meta : true,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should support outputting metadata about CSS dependencies to a named file ", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/metadata/a.js"),
                    require.resolve("./specimens/metadata/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                        meta : "chunks.json",
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should support splitting up CSS files w/ shared assets", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/css-chunks/a.js"),
                    require.resolve("./specimens/css-chunks/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("shouldn't put bundle-specific CSS in common.css", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/common-splitting/a.js"),
                    require.resolve("./specimens/common-splitting/c.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should support manual chunks", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/manual-chunks/a.js"),
                    require.resolve("./specimens/manual-chunks/b.js"),
                ],

                manualChunks : {
                    shared : [
                        require.resolve("./specimens/manual-chunks/c.js"),
                    ],
                },

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should support dynamic imports", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/dynamic-imports/a.js"),
                    require.resolve("./specimens/dynamic-imports/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("shouldn't break when dynamic imports are tree-shaken away (rollup/rollup#2659)", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/stripped-dynamic-imports/a.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should ouput only 1 JSON file", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/simple.js"),
                    require.resolve("./specimens/dependencies.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                        json,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("shouldn't use entry hashes as part of the CSS file names", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/simple.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],

            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                entryFileNames : "[name].[hash].js",
            })).toMatchRollupSnapshot();
        });

        it("should dedupe chunk names using rollup's incrementing counter logic", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/multiple-chunks/a.js"),
                    require.resolve("./specimens/multiple-chunks/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map : false,
                    }),
                ],

            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupAssetSnapshot();
        });

        it("should dedupe chunk names using rollup's incrementing counter logic (hashed)", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/multiple-chunks/a.js"),
                    require.resolve("./specimens/multiple-chunks/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map : {
                            inline : false,
                        },
                    }),
                ],

            });

            await expect(await bundle.generate({
                format,
                sourcemap,
            })).toMatchRollupAssetSnapshot();
        });

        it("should support circular JS dependencies", async () => {
            const bundle = await rollup({
                onwarn(warning, handler) {
                    if(warning.code === "CIRCULAR_DEPENDENCY") {
                        return;
                    }

                    handler(warning);
                },

                input : [
                    require.resolve("./specimens/circular-dependencies/a.js"),
                    require.resolve("./specimens/circular-dependencies/b.js"),
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],
            });

            await expect(await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            })).toMatchRollupSnapshot();
        });
    });
});
