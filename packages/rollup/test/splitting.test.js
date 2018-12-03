/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const shell = require("shelljs");

const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer = require("@modular-css/test-utils/namer.js");

const plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;
const sourcemap = false;
const json = true;

describe("/rollup.js", () => {
    beforeAll(() => shell.rm("-rf", prefix("./output/*")));

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
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/splitting`),
            });

            expect(dir("./splitting/assets")).toMatchSnapshot();
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
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/css-chunks`),
            });

            expect(dir("./css-chunks/assets")).toMatchSnapshot();
        });

        it("shouldn't put bundle-specific CSS in common.css", async () => {
            const bundle = await rollup({
                experimentalCodeSplitting,

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
                sourcemap,

                assetFileNames,
                chunkFileNames,

                dir : prefix(`./output/manual-chunks`),
            });

            expect(dir("./manual-chunks/assets")).toMatchSnapshot();
        });

        it("should support dynamic imports", async () => {
            const bundle = await rollup({
                experimentalCodeSplitting,

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

        it("should ouput only 1 JSON file", async () => {
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
    });
});
