/* eslint-disable max-statements, no-await-in-loop */
"use strict";

const { rollup } = require("rollup");

const shell = require("shelljs");

const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer  = require("@modular-css/test-utils/namer.js");
const logs   = require("@modular-css/test-utils/logs.js");

const css = require("@modular-css/rollup");

const rewriter = require("../rewriter.js");

const assetFileNames = "assets/[name][extname]";
const chunkFileNames = "[name].js";
const map = false;
const sourcemap = false;

const formats = [ "amd", "es", "esm", "system" ];

describe("rollup-rewriter", () => {
    beforeAll(() => shell.rm("-rf", prefix("./output/*")));

    it("should require a loadfn", async () => {
        expect(() => rewriter({})).toThrow();
    });

    it.each([
        "cjs",
    ])("should error on unsupported formats (%s)", async (format) => {
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

        await expect(bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        })).rejects.toThrowErrorMatchingSnapshot();
    });

    it.each(formats)("shouldn't require a loader (%s)", async (format) => {
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

        const result = await bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        expect(result).toMatchRollupSnapshot();
    });

    it.each(formats)("should support loader & loadfn (%s)", async (format) => {
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

        const result = await bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        expect(result).toMatchRollupSnapshot();
    });
    
    it.each(formats)("should support loader being a function (%s)", async (format) => {
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

        const result = await bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it.each(formats)("should only rewrite when necessary (%s)", async (format) => {
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

        const result = await bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        expect(result).toMatchRollupSnapshot();
    });

    it.each(formats)("should ignore unknown imports (%s)", async (format) => {
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

        const result = await bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        expect(result).toMatchRollupSnapshot();
    });

    it.each(formats)("should include css for static imports used by a dynamic import (%s)", async (format) => {
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

        const result = await bundle.generate({
            format,
            sourcemap,

            assetFileNames,
            chunkFileNames,
            exports : "auto",
        });

        expect(result).toMatchRollupSnapshot();
    });

    // eslint-disable-next-line jest/expect-expect
    it("should log details in verbose mode", async () => {
        const { calls } = logs();

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

        expect(calls()).toMatchSnapshot();
    });
});
