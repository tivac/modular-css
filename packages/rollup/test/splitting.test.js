/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const shell = require("shelljs");

const read = require("test-utils/read.js")(__dirname);
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

            expect(read("./rollup/splitting/assets/common.css")).toMatchSnapshot();
            expect(read("./rollup/splitting/assets/dependencies.css")).toMatchSnapshot();
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

            expect(read("./rollup/css-chunking/assets/a.css")).toMatchSnapshot();
            expect(read("./rollup/css-chunking/assets/b.css")).toMatchSnapshot();
            expect(read("./rollup/css-chunking/assets/chunk.css")).toMatchSnapshot();
            expect(read("./rollup/css-chunking/assets/common.css")).toMatchSnapshot();
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

            expect(read("./rollup/manual-chunks/assets/a.css")).toMatchSnapshot();
            expect(read("./rollup/manual-chunks/assets/b.css")).toMatchSnapshot();
            expect(read("./rollup/manual-chunks/assets/common.css")).toMatchSnapshot();
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

            expect(read("./rollup/dynamic-imports/assets/a.css")).toMatchSnapshot();
            expect(read("./rollup/dynamic-imports/assets/b.css")).toMatchSnapshot();
            expect(read("./rollup/dynamic-imports/assets/c.css")).toMatchSnapshot();
            expect(read("./rollup/dynamic-imports/assets/common.css")).toMatchSnapshot();
        });
    });
});
