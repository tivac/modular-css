/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const shell = require("shelljs");

const Processor = require("@modular-css/processor");

const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
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
    beforeAll(() => shell.rm("-rf", prefix("./output/*")));

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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/splitting`),
            });

            expect(dir("./splitting/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/css-dependencies`),
            });

            expect(dir("./css-dependencies/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/css-metadata`),
            });

            expect(dir("./css-metadata/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/css-metadata-common`),
            });

            expect(dir("./css-metadata-common/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/css-metadata-named`),
            });

            expect(dir("./css-metadata-named/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/css-chunks`),
            });

            expect(dir("./css-chunks/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/common-splitting`),
            });

            expect(dir("./common-splitting/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/manual-chunks`),
            });

            expect(dir("./manual-chunks/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/dynamic-imports`),
            });

            expect(dir("./dynamic-imports/assets/")).toMatchSnapshot();
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

            await bundle.generate({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,
            });
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/json-splitting`),
            });

            expect(dir("./json-splitting/assets")).toMatchSnapshot();
        });

        it("shouldn't use entry hashes as part of the CSS file names", async () => {
            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/simple.js")
                ],

                plugins : [
                    plugin({
                        namer,
                        map,
                    }),
                ],

            });

            await bundle.write({
                format,
                sourcemap,

                entryFileNames : "[name].[hash].js",

                dir : prefix(`./output/no-hash-names/`),
            });

            expect(dir("./no-hash-names")).toMatchSnapshot();
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
                        map : {
                            inline : false,
                        },
                    }),
                ],

            });

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/multiple-chunks/`),
            });

            expect(dir("./multiple-chunks/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                dir : prefix(`./output/multiple-chunks-hashed/`),
            });

            expect(dir("./multiple-chunks-hashed/assets")).toMatchSnapshot();
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

            await bundle.write({
                format,
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/circular-dependencies`)
            });

            expect(dir(`./circular-dependencies`)).toMatchSnapshot();
        });
    });
});
