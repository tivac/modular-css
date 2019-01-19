/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const dedent = require("dedent");
const shell = require("shelljs");

const read    = require("@modular-css/test-utils/read.js")(__dirname);
const readdir = require("@modular-css/test-utils/read-dir.js")(__dirname);
const exists  = require("@modular-css/test-utils/exists.js")(__dirname);
const prefix  = require("@modular-css/test-utils/prefix.js")(__dirname);
const dir     = require("@modular-css/test-utils/read-dir.js")(__dirname);
const namer   = require("@modular-css/test-utils/namer.js");
const logs    = require("@modular-css/test-utils/logs.js");

require("@modular-css/test-utils/rollup-code-snapshot.js");

const css = require("@modular-css/rollup");

const rewriter = require("../rewriter.js");

const assetFileNames = "assets/[name][extname]";
const chunkFileNames = "[name].js";
const format = "es";
const map = false;
const sourcemap = false;

describe("rollup-rewriter", () => {
    beforeAll(() => shell.rm("-rf", prefix("./output/*")));

    it("should rewrite dynamic imports", async () => {
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
                    verbose : true,
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

        expect(dir("./dynamic-imports/")).toMatchSnapshot();
    });
});
