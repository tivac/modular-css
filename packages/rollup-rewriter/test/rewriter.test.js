/* eslint-disable max-statements, no-await-in-loop */
"use strict";

const { rollup } = require("rollup");

const shell = require("shelljs");

const prefix  = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer   = require("@modular-css/test-utils/namer.js");

require("@modular-css/test-utils/rollup-build-snapshot.js");

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

    it("shouldn't require a loader", async () => {
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

        for(const format of formats) {
            const result = await bundle.generate({
                format,
                sourcemap,
    
                assetFileNames,
                chunkFileNames,
            });
    
            expect(result).toMatchRollupSnapshot(format);
        }
    });

    it("should support loader & loadfn", async () => {
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

        for(const format of formats) {
            const result = await bundle.generate({
                format,
                sourcemap,
    
                assetFileNames,
                chunkFileNames,
            });
    
            expect(result).toMatchRollupSnapshot(format);
        }
    });
});
