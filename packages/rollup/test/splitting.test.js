/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const shell = require("shelljs");

const dir = require("test-utils/read-dir.js")(__dirname);
const prefix = require("test-utils/prefix.js")(__dirname);
const namer = require("test-utils/namer.js");

const plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;

describe("/rollup.js", () => {
    beforeAll(() => shell.rm("-rf", prefix("./output/rollup/*")));
    
    describe("code splitting", () => {
        const experimentalCodeSplitting = true;
        const chunkFileNames = "[name].js";

        it("should support splitting up CSS files", async () => {
            const bundle = await rollup({
                experimentalCodeSplitting,
                
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

                assetFileNames,
                chunkFileNames,
                
                dir : prefix(`./output/rollup/splitting`),
            });

            expect(dir("./rollup/splitting/assets")).toMatchSnapshot();
        });

        it("should support splitting up CSS files w/ shared assets", async () => {
            const bundle = await rollup({
                experimentalCodeSplitting,

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

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/rollup/css-chunking`),
            });

            expect(dir("./rollup/css-chunking/assets")).toMatchSnapshot();
        });

        it("should support manual chunks", async () => {
            const bundle = await rollup({
                experimentalCodeSplitting,

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

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/rollup/manual-chunks`),
            });

            expect(dir("./rollup/manual-chunks/assets")).toMatchSnapshot();
        });

        it("should support dynamic imports", async () => {
            const bundle = await rollup({
                experimentalCodeSplitting,

                // treeshake : false,

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

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/rollup/dynamic-imports`),
            });

            expect(dir("./rollup/dynamic-imports/assets/")).toMatchSnapshot();
        });
    });
});
