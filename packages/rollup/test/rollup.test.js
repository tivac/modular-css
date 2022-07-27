"use strict";

const { rollup } = require("rollup");

const dedent = require("dedent");
const shell = require("shelljs");
const cssnano = require("cssnano");
const files = require("rollup-plugin-hypothetical");

const read = require("@modular-css/test-utils/read.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer = require("@modular-css/test-utils/namer.js");
const logspy = require("@modular-css/test-utils/logs.js");

const Processor = require("@modular-css/processor");

const plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;

// eslint-disable-next-line max-statements -- I got a lotta tests c'mon
describe("/rollup.js", () => {
    const createPlugin = (opts = {}) => plugin({
        namer,
        map,
        ...opts,
    });

    beforeAll(() => shell.rm("-rf", prefix("./output/*")));

    it("should be a function", () =>
        expect(typeof plugin).toBe("function")
    );

    it("should generate exports", async () => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/simple.js`),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupCodeSnapshot();
    });

    it("should express locally-composed classes correctly", async () => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/local-composition.js`),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should express layers of locally-composed classes correctly", async () => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/composition-layers/composition-layers.js`),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should express local & remote-composed classes correctly", async () => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/internal-external-composition/internal-external-composition.js`),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should be able to tree-shake results", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/tree-shaking.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupCodeSnapshot();
    });

    it("should generate CSS", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupAssetSnapshot();
    });

    it("should handle assetFileNames being undefined", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
            })
        ).toMatchRollupAssetSnapshot();
    });

    it("should correctly pass to/from params for relative paths", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/relative-paths.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
                file : prefix(`./output/relative-paths/relative-paths.js`),
            })
        ).toMatchRollupAssetSnapshot();
    });

    it("should correctly handle hashed output", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames : "assets/[name]-[hash][extname]",
            })
        ).toMatchRollupSnapshot();
    });

    it("should correctly handle hashed output with external source maps & json files", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin({
                    map  : { inline : false },
                    json : true,
                }),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames : "assets/[name]-[hash][extname]",
            })
        ).toMatchRollupSnapshot();
    });

    it("should avoid generating empty CSS", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/no-css.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupAssetSnapshot();
    });

    it("should ignore external modules", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/external.js"),
            plugins : [
                createPlugin(),
            ],
            external : [
                require.resolve("./specimens/simple.js"),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupAssetSnapshot();
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
                createPlugin({
                    processor,
                }),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupAssetSnapshot();
    });

    it("should output assets with a .css file extension", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/file-extension/entry.js"),
            plugins : [
                createPlugin({
                    include : /\.cssx$/,
                }),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should respect the CSS dependency tree", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/dependencies.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should support namespaced @value imports", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/namespaced/namespaced.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should support external @value aliases", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/external-value-aliasing/external-value-aliasing.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should support mixing all @value types", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/all-value-types/all-value-types.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should support multiple selectors", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/multi-selector/multi-selector.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should support @value and class overlap", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/class-value-overlap/class-value-overlap.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should support @value camelCase overlap", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/value-camel-overlap.js"),
            plugins : [
                createPlugin(),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    it("should output classes in topological order", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/topological-order/topological-order.js"),
            plugins : [
                createPlugin({ namer }),
            ],
        });

        expect(
            await bundle.generate({
                format,
                assetFileNames,
            })
        ).toMatchRollupSnapshot();
    });

    describe("dev mode option", () => {
        it("should output a proxy", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        dev : true,
                    }),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                })
            ).toMatchRollupCodeSnapshot();
        });
    });

    describe("json option", () => {
        it("should generate JSON", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        json : true,
                    }),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            ).toMatchRollupAssetSnapshot();
        });

        it("should generate JSON with a custom name", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        json : "custom.json",
                    }),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            ).toMatchRollupAssetSnapshot();
        });
    });

    describe("Exports option", () => {
        it("should provide named exports by default", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/named.js"),
                plugins : [
                    createPlugin(),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                })
            ).toMatchRollupCodeSnapshot();
        });

        it("should warn & rewrite invalid identifiers (namedExports.rewriteInvalid = true)", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/invalid-name.js"),
                onwarn  : (msg) => expect(msg).toMatchSnapshot({ id : expect.any(String) }),
                plugins : [
                    createPlugin({
                        namedExports : {
                            rewriteInvalid : true,
                        },
                    }),
                ],
            });

            const result = await bundle.generate({
                format,
                assetFileNames,
            });

            expect(result).toMatchRollupCodeSnapshot();
        });

        it("should warn & ignore invalid identifiers (namedExports.rewriteInvalid = false)", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/invalid-name.js"),
                onwarn  : (msg) => expect(msg).toMatchSnapshot({ id : expect.any(String) }),
                plugins : [
                    createPlugin({
                        namedExports : {
                            rewriteInvalid : false,
                        },
                    }),
                ],
            });

            const result = await bundle.generate({
                format,
                assetFileNames,
            });

            expect(result).toMatchRollupCodeSnapshot();
        });

        it("should warn if named exports are falsey", async () => {
            const spy = logspy("warn");

            await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        namedExports : false,
                    }),
                ],
            });

            expect(spy).toMatchLogspySnapshot();
        });

        it("should generated valid JS even when identifiers aren't", async () => {
            logspy("warn");

            const bundle = await rollup({
                input   : require.resolve("./specimens/composes-from-invalid-js/entry.js"),
                plugins : [
                    createPlugin(),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                })
            ).toMatchRollupCodeSnapshot();
        });
    });

    describe("styleExport option", () => {
        it("should provide style export", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/style-export.js"),
                plugins : [
                    createPlugin({
                        styleExport : true,
                    }),
                ],
            });

            const result = await bundle.generate({
                format,
            });

            expect(result).toMatchRollupCodeSnapshot();
        });

        it("should warn that styleExport and done aren't compatible", async () => {
            const spy = logspy("warn");

            await rollup({
                input   : require.resolve("./specimens/style-export.js"),
                plugins : [
                    createPlugin({
                        styleExport : true,
                        done        : [
                            () => { /* NO OP */ },
                        ],
                    }),
                ],
            });

            expect(spy).toMatchLogspySnapshot();
        });
    });

    describe("source maps", () => {
        it("should generate external source maps", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
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


        it("shouldn't disable sourcemap generation", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
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
                    createPlugin({
                    }),
                ],
            });

            expect(
                await bundle.generate({
                    assetFileNames,
                    format,
                })
            ).toMatchRollupAssetSnapshot();
        });
    });

    describe("processor option", () => {
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
                    createPlugin({
                        processor,
                    }),
                ],
            });

            const result = await bundle.generate({
                format,
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
                    createPlugin({
                        processor,
                    }),
                ],
            });

            const result = await bundle.generate({
                format,
                assetFileNames,

                file : prefix(`./output/existing-processor-no-css/existing-processor-no-css.js`),
            });

            expect(result).toMatchRollupAssetSnapshot();
        });
    });

    describe("verbose option", () => {
        it("should log in verbose mode", async () => {
            const spy = logspy();

            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
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

            expect(spy).toMatchLogspySnapshot();
        });
    });

    describe("empties option", () => {
        it("should write out empty CSS files when empties is enabled", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/empty.js"),
                plugins : [
                    createPlugin({
                        empties : true,

                        done : [
                            cssnano(),
                        ],
                    }),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            ).toMatchRollupAssetSnapshot();
        });

        it("should not write out empty CSS files by default", async () => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/empty.js"),
                plugins : [
                    createPlugin({
                        done : [
                            cssnano(),
                        ],
                    }),
                ],
            });

            expect(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            ).toMatchRollupAssetSnapshot();
        });
    });

    describe("case sensitivity tests", () => {
        const fs = require("fs");
        let fn = it;

        // Verify that filesystem is case-insensitive before bothering
        fs.writeFileSync("./packages/rollup/test/output/sensitive.txt", "");

        try {
            fs.statSync("./packages/rollup/test/output/SENSITIVE.txt");
        } catch(e) {
            fn = it.skip;
        }

        fn("should warn about repeated references that point at the same files", async () => {
            const spy = logspy("warn");

            const bundle = await rollup({
                input   : require.resolve("./specimens/casing/main.js"),
                plugins : [
                    createPlugin({
                    }),
                ],
            });

            await bundle.write({
                format,
                assetFileNames,
                file : prefix(`./output/casing/main.js`),
            });

            // eslint-disable-next-line jest/no-standalone-expect -- we're getting fancy
            expect(spy).toHaveBeenCalled();

            // eslint-disable-next-line jest/no-standalone-expect -- we be fancy
            expect(spy.mock.calls.length).toBeGreaterThan(0);
        });
    });

    describe("errors", () => {
        function checkError(err) {
            expect(err.toString()).toMatch("error-plugin:");
        }

        it("should show useful CSS error messages", () => {
            let e;

            return rollup({
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

                    createPlugin({ namer }),
                ],
            })
            .catch((err) => {
                e = err;
            })
            .finally(() => expect(e.toString()).toMatch(".wooga"));
        });

        // eslint-disable-next-line jest/expect-expect -- just looking for the throw
        it("should throw errors in in before plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        css    : prefix(`./output/errors.css`),
                        before : [ error ],
                    }),
                ],
            })
            .catch(checkError)
        );

        // eslint-disable-next-line jest/expect-expect -- just looking for the throw
        it("should throw errors in after plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        css   : prefix(`./output/errors.css`),
                        after : [ error ],
                    }),
                ],
            })
            .catch(checkError)
        );

        // Skipped because I can't figure out how to catch the error being thrown?
        // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect -- shit happens
        it.skip("should throw errors in done plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
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
