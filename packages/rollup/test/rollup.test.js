/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const dedent = require("dedent");
const shell = require("shelljs");
const cssnano = require("cssnano");
const files = require("rollup-plugin-hypothetical");

const read    = require("@modular-css/test-utils/read.js")(__dirname);
const exists  = require("@modular-css/test-utils/exists.js")(__dirname);
const prefix  = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer   = require("@modular-css/test-utils/namer.js");
const logs    = require("@modular-css/test-utils/logs.js");

const Processor = require("@modular-css/processor");

const plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;
const sourcemap = false;

describe("/rollup.js", () => {
    beforeAll(() => shell.rm("-rf", prefix("./output/*")));

    it("should be a function", () =>
        expect(typeof plugin).toBe("function")
    );

    it("should generate exports", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                }),
            ],
        });

        const result = await bundle.generate({ format });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("should be able to tree-shake results", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/tree-shaking.js"),
            plugins : [
                plugin({
                    namer,
                }),
            ],
        });

        const result = await bundle.generate({ format });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("should generate CSS", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
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
            file : prefix(`./output/css/simple.js`),
        });

        expect(read("./css/assets/simple.css")).toMatchSnapshot();
    });

    it("should handle assetFileNames being undefined", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map,
                }),
            ],
        });

        await bundle.write({
            format,
            file : prefix(`./output/assetFileNames/simple.js`),
        });

        const [ css ] = shell.ls(prefix(`./output/assetFileNames/assets`));

        expect(read(`assetFileNames/assets/${css}`)).toMatchSnapshot();
    });

    it("should correctly pass to/from params for relative paths", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/relative-paths.js"),
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
            file : prefix(`./output/relative-paths/relative-paths.js`),
        });

        expect(read("./relative-paths/assets/relative-paths.css")).toMatchSnapshot();
    });

    it("should correctly handle hashed output", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            file : prefix(`./output/hashes/hashes.js`),
        });

        expect(result).toMatchRollupSnapshot();
    });

    it("should correctly handle hashed output with external source maps & json files", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map  : { inline : false },
                    json : true,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            file : prefix(`./output/hashes/hashes.js`),
        });

        expect(result).toMatchRollupSnapshot();
    });

    it("should avoid generating empty CSS", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/no-css.js"),
            plugins : [
                plugin({
                    namer,
                }),
            ],
        });

        await bundle.write({
            format,
            assetFileNames,
            file : prefix(`./output/no-css/no-css.js`),
        });

        expect(exists("./output/no-css/assets/no-css.css")).toBe(false);
    });

    it("should ignore external modules", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/external.js"),
            plugins : [
                plugin({
                    namer,
                }),
            ],
            external : [
                require.resolve("./specimens/simple.js"),
            ],
        });

        await bundle.generate({
            format,
            assetFileNames,
            file : prefix(`./output/no-css/no-css.js`),
        });
    });

    it("should generate JSON", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    json : true,
                }),
            ],
        });

        await bundle.write({
            format,
            assetFileNames,
            file : prefix(`./output/json/simple.js`),
        });

        expect(read("./json/assets/exports.json")).toMatchSnapshot();
    });

    it("should generate JSON with a custom name", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    json : "custom.json",
                }),
            ],
        });

        await bundle.write({
            format,
            assetFileNames,
            file : prefix(`./output/json-named/simple.js`),
        });

        expect(read("./json-named/assets/custom.json")).toMatchSnapshot();
    });

    it("should output unreferenced CSS", async () => {
        const processor = new Processor({
            namer,
            map,
        });

        await processor.string("./packages/rollup/test/specimens/fake.css", dedent(`
            .fake {
                color: yellow;
            }
        `));

        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    processor,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            assetFileNames,
            file : prefix(`./output/common-option/simple.js`),
        });

        expect(result).toMatchRollupAssetSnapshot();
    });

    it("should provide named exports", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/named.js"),
            plugins : [
                plugin({
                    namer,
                }),
            ],
        });

        const result = await bundle.generate({ format });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("should provide style export", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/style-export.js"),
            plugins : [
                plugin({
                    namer,
                    styleExport : true,
                }),
            ],
        });

        const result = await bundle.generate({ format });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("should warn that styleExport and done aren't compatible", async () => {
        const { logSnapshot } = logs("warn");

        await rollup({
            input   : require.resolve("./specimens/style-export.js"),
            plugins : [
                plugin({
                    namer,
                    styleExport : true,
                    done        : [
                        () => { /* NO OP */ },
                    ],
                }),
            ],
        });

        logSnapshot();
    });

    it("should generate external source maps", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
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
            assetFileNames,
            file : prefix(`./output/external-source-maps/simple.js`),
        });

        // Have to parse it into JSON so the propertyMatcher can exclude the file property
        // since it is a hash value and changes constantly
        expect(JSON.parse(read("./external-source-maps/assets/simple.css.map"))).toMatchSnapshot({
            file : expect.any(String),
        });

        expect(read("./external-source-maps/assets/simple.css")).toMatchSnapshot();
    });

    it("should warn & not export individual keys when they are not valid identifiers", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/invalid-name.js"),
            onwarn  : (msg) => expect(msg).toMatchSnapshot({ id : expect.any(String) }),
            plugins : [
                plugin({
                    namer,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            assetFileNames,
        });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("should allow disabling of named exports", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    namedExports : false,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            assetFileNames,
        });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("shouldn't disable sourcemap generation", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    sourcemap : true,
                }),
            ],
        });

        const { output } = await bundle.generate({
            format,
            assetFileNames,

            sourcemap : true,
        });

        // Find first chunk w/ a .map property, then compare it to snapshot
        expect(output.find((chunk) => chunk.map).map).toMatchSnapshot();
    });

    it("should not output sourcemaps when they are disabled", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map,
                }),
            ],
        });

        await bundle.write({
            assetFileNames,
            format,
            sourcemap,

            file : prefix(`./output/no-maps/no-maps.js`),
        });

        expect(read("./no-maps/assets/simple.css")).toMatchSnapshot();
    });

    it("should respect the CSS dependency tree", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/dependencies.js"),
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
            sourcemap,

            file : prefix(`./output/dependencies/dependencies.js`),
        });

        expect(read("./dependencies/dependencies.js")).toMatchSnapshot();
        expect(read("./dependencies/assets/dependencies.css")).toMatchSnapshot();
    });

    it("should accept an existing processor instance", async () => {
        const processor = new Processor({
            namer,
            map,
        });

        await processor.string("./packages/rollup/test/specimens/fake.css", dedent(`
            .fake {
                color: yellow;
            }
        `));

        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    processor,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            sourcemap,
            assetFileNames,

            file : prefix(`./output/existing-processor/existing-processor.js`),
        });

        expect(result).toMatchRollupAssetSnapshot();
    });

    it("should accept an existing processor instance (no css in bundle)", async () => {
        const processor = new Processor({
            namer,
            map,
        });

        await processor.string("./packages/rollup/test/specimens/fake.css", dedent(`
            .fake {
                color: yellow;
            }
        `));

        const bundle = await rollup({
            input   : require.resolve("./specimens/no-css.js"),
            plugins : [
                plugin({
                    processor,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            sourcemap,
            assetFileNames,

            file : prefix(`./output/existing-processor-no-css/existing-processor-no-css.js`),
        });

        expect(result).toMatchRollupAssetSnapshot();
    });

    it("should output a proxy in dev mode", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    dev : true,
                }),
            ],
        });

        const result = await bundle.generate({ format });

        expect(result).toMatchRollupCodeSnapshot();
    });

    it("should log in verbose mode", async () => {
        const { logSnapshot } = logs();

        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    verbose : true,
                }),
            ],
        });

        await bundle.generate({
            format,
            assetFileNames,
        });

        const processor = new Processor({
            namer,
            verbose : true,
        });

        await processor.file("./packages/processor/test/specimens/start.css");
        await processor.string(
            "packages/processor/test/specimens/string.css",
            ".foo { color: fuschia; }"
        );

        await processor.output();

        logSnapshot();
    });

    it("should output assets with a .css file extension", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/file-extension/entry.js"),
            plugins : [
                plugin({
                    namer,
                    include : /\.cssx$/,
                }),
            ],
        });

        const result = await bundle.generate({
            format,
            assetFileNames,
        });

        expect(result).toMatchRollupSnapshot();
    });

    it("should write out empty CSS files by default", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/empty.js"),
            plugins : [
                plugin({
                    namer,
                    map,

                    done : [
                        cssnano(),
                    ],
                }),
            ],
        });

        await bundle.write({
            format,
            assetFileNames,
            file : prefix(`./output/empty-css/empty.js`),
        });

        expect(read("./empty-css/assets/empty.css")).toMatchSnapshot();
    });

    it("should not write out empty CSS files when empties is falsey", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/empty.js"),
            plugins : [
                plugin({
                    namer,
                    map,
                    empties : false,

                    done : [
                        cssnano(),
                    ],
                }),
            ],
        });

        await bundle.write({
            format,
            assetFileNames,
            file : prefix(`./output/no-empty-css/empty.js`),
        });

        expect(exists("./output/no-empty-css/assets/empty.css")).toBe(false);
    });

    describe("case sensitivity tests", () => {
        const fs = require("fs");
        let fn = it;

        // Verify that filesystem is case-insensitive before bothering
        fs.writeFileSync("./packages/rollup/test/output/sensitive.txt");

        try {
            fs.statSync("./packages/rollup/test/output/SENSITIVE.txt");
        } catch(e) {
            fn = it.skip;
        }

        fn("should warn about repeated references that point at the same files", async () => {
            const { spy } = logs("warn");

            const bundle = await rollup({
                input   : require.resolve("./specimens/casing/main.js"),
                plugins : [
                    plugin({
                        map,
                    }),
                ],
            });

            await bundle.write({
                format,
                assetFileNames,
                sourcemap,
                file : prefix(`./output/casing/main.js`),
            });

            // eslint-disable-next-line jest/no-standalone-expect
            expect(spy).toHaveBeenCalled();

            // eslint-disable-next-line jest/no-standalone-expect
            expect(spy.mock.calls.length).toBeGreaterThan(0);
        });
    });

    describe("errors", () => {
        function checkError(err) {
            expect(err.toString()).toMatch("error-plugin:");
        }

        it("should show useful CSS error messages", () =>
            rollup({
                input   : "error.js",
                plugins : [
                    files({
                        leaveIdsAlone : true,
                        files         : {
                            "error.js" : `
                                import css from "error.css";

                                console.log(css);
                            `,
                            "error.css" : `
                                .fooga { color: #F00; }
                                .wooga { composes: foo; }
                            `,
                        },
                    }),

                    plugin({ namer }),
                ],
            })
            .catch((e) => expect(e.toString()).toMatch(".wooga"))
        );


        it("should throw errors in in before plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    plugin({
                        namer,
                        css    : prefix(`./output/errors.css`),
                        before : [ error ],
                    }),
                ],
            })
            .catch(checkError)
        );

        it("should throw errors in after plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    plugin({
                        namer,
                        css   : prefix(`./output/errors.css`),
                        after : [ error ],
                    }),
                ],
            })
            .catch(checkError)
        );

        // Skipped because I can't figure out how to catch the error being thrown?
        it.skip("should throw errors in done plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    plugin({
                        namer,
                        css  : prefix(`./output/errors.css`),
                        done : [ error ],
                    }),
                ],
            })
            .then((bundle) => bundle.write({
                format,
                file : prefix(`./output/done-error.js`),
            }))
        );
    });
});
