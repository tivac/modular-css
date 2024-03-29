"use strict";

const path = require("path");

const shell = require("shelljs");
const { rollup } = require("rollup");

const { nodeResolve : resolvePlugin } = require("@rollup/plugin-node-resolve");
const sveltePlugin = require("rollup-plugin-svelte");
const mcssPlugin = require("@modular-css/rollup");
const hypotheticalPlugin = require("rollup-plugin-hypothetical");

const write = require("@modular-css/test-utils/write.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const dir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const watching = require("@modular-css/test-utils/rollup-watching.js");
const logspy = require("@modular-css/test-utils/logs.js");

const plugin = require("../svelte.js");

const assetFileNames = "assets/[name][extname]";
const format = "es";

// eslint-disable-next-line jest/no-disabled-tests -- failing with rollup@4
describe.skip("/svelte.js", () => {
    describe("rollup watching", () => {
        const { watch } = require("rollup");
        let watcher;

        beforeAll(() => shell.rm("-rf", prefix(`./output/rollup/*`)));
        afterEach(() => watcher.close());

        it("should generate updated output", async () => {
            // Eat console.warn calls because we don't need 'em
            logspy("warn");

            const { preprocess, processor } = plugin();

            // Create v1 of the files
            write(`./rollup/input/index.js`, `
                import app from "./app.svelte";
                console.log(app);
            `);

            write(`./rollup/input/app.svelte`, `
                <div class="{css.nope}">Hi</div>
            `);

            // Start watching
            watcher = watch({
                input  : prefix(`./output/rollup/input/index.js`),
                output : {
                    file : prefix(`./output/rollup/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    resolvePlugin(),
                    sveltePlugin({
                        preprocess,
                    }),
                    mcssPlugin({
                        processor,
                    }),
                ],
            });

            const wait = watching.promise(watcher);

            await wait();

            const v1 = dir("./rollup/output/");

            setTimeout(() => {
                write(`./rollup/input/app.css`, `
                    .nope {
                        color: blue;
                    }
                `);

                write(`./rollup/input/app.svelte`, `
                    <link rel="stylesheet" href="./app.css" />
                    <div class="{css.nope}">Hi</div>
                `);
            }, 100);

            await wait();

            const v2 = dir("./rollup/output/");

            expect(v1).toMatchDiffSnapshot(v2, {
                // Get specific to avoid some build-related weirdness
                contextLines     : 0,
                stablePatchmarks : true,
            });
        });

        it("should generate updated output when composition changes", async () => {
            const { preprocess, processor } = plugin();

            // Create v1 of the files
            write(`./rollup-composes/input/index.js`, `
                import app from "./app.svelte";
                console.log(app);
            `);

            write(`./rollup-composes/input/app.svelte`, `
                <link rel="stylesheet" href="./app.css" />
                <div class="{css.a}">Hi</div>
            `);

            write(`./rollup-composes/input/app.css`, `
                .a {
                    composes: b from "./other.css";

                    color: red;
                }
            `);

            write(`./rollup-composes/input/other.css`, `
                .b {
                    background: blue;
                }

                .c {
                    background: green;
                }
            `);

            // Start watching
            watcher = watch({
                input  : prefix(`./output/rollup-composes/input/index.js`),
                output : {
                    file : prefix(`./output/rollup-composes/output/output.js`),
                    format,
                    assetFileNames,
                },
                plugins : [
                    resolvePlugin(),
                    sveltePlugin({
                        preprocess,
                    }),
                    mcssPlugin({
                        processor,
                    }),
                ],
            });

            const wait = watching.promise(watcher);

            await wait();

            const v1 = dir("./rollup-composes/output/");

            setTimeout(() => write(`./rollup-composes/input/app.css`, `
                .a {
                    composes: c from "./other.css";

                    color: red;
                }
            `), 100);

            await wait();

            const v2 = dir("./rollup-composes/output/");

            expect(v1).toMatchDiffSnapshot(v2);

            wait.close();
        });
    });

    describe("rollup errors", () => {
        it.each([
            "link",
            "style",
        ])("should show useful errors from rollup (<%s>)", async (type) => {
            const { preprocess, processor } = plugin();

            await expect(rollup({
                input : "./error.js",

                plugins : [
                    hypotheticalPlugin({
                        cwd   : path.join(__dirname, "./specimens"),
                        files : {
                            "./error.js" : `
                                import Component from "./error-${type}.svelte";

                                console.log(Component);
                            `,
                        },

                        allowFallthrough : true,
                    }),
                    resolvePlugin(),
                    sveltePlugin({
                        preprocess,
                    }),
                    mcssPlugin({
                        processor,
                    }),
                ],
            })).rejects.toThrow(/\.wooga/);
        });

        it("should show useful errors from rollup (non-css file)", async () => {
            const spy = logspy("warn");

            const { preprocess, processor } = plugin();

            await expect(rollup({
                input : "./error.js",

                plugins : [
                    hypotheticalPlugin({
                        cwd   : path.join(__dirname, "./specimens"),
                        files : {
                            "./error.js" : `
                                import Component from "./error-link-non-css.svelte";

                                console.log(Component);
                            `,
                        },

                        allowFallthrough : true,
                    }),
                    resolvePlugin(),
                    sveltePlugin({
                        preprocess,
                    }),
                    mcssPlugin({
                        processor,
                    }),
                ],
            })).rejects.toThrow("error-link.svelte:1:1: Unknown word");

            expect(spy).toHaveBeenCalled();
            expect(spy).toMatchLogspySnapshot();
        });
    });

    describe("rollup chunking", () => {
        it("should correctly chunk svelte files using inline <style>", async () => {
            const { preprocess, processor } = plugin();

            const bundle = await rollup({
                input : [
                    require.resolve("./specimens/inline-chunking/a.svelte"),
                    require.resolve("./specimens/inline-chunking/b.svelte"),
                ],

                plugins : [
                    resolvePlugin(),
                    sveltePlugin({
                        preprocess,
                    }),
                    mcssPlugin({
                        processor,
                    }),
                ],
            });

            const out = await bundle.generate({
                format         : "esm",
                assetFileNames : "[name][extname]",
                chunkFileNames : "[name]",
            });

            expect(out).toMatchRollupAssetSnapshot();
        });
    });
});
