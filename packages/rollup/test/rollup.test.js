const { describe, it } = require("node:test");

const { rollup } = require("rollup");

const dedent = require("dedent");
const shell = require("shelljs");
const cssnano = require("cssnano");
const files = require("rollup-plugin-hypothetical");

const read = require("@modular-css/test-utils/read.js")(__dirname);
const prefix = require("@modular-css/test-utils/prefix.js")(__dirname);
const namer = require("@modular-css/test-utils/namer.js");
const { logSpy, logSpyCalls } = require("@modular-css/test-utils/logs.js");
const { rollupBundle } = require("@modular-css/test-utils/rollup.js");

const Processor = require("@modular-css/processor");

const plugin = require("../rollup.js");
const relative = require("@modular-css/test-utils/relative.js");

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

    shell.rm("-rf", prefix("./output/*"));

    it("should be a function", (t) =>
        t.assert.strictEqual(typeof plugin, "function")
    );

    it("should generate exports", async (t) => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/simple.js`),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                }),
                { assets : false, code : true },
            )
        );
    });

    it("should express locally-composed classes correctly", async (t) => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/local-composition.js`),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should express layers of locally-composed classes correctly", async (t) => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/composition-layers/composition-layers.js`),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should express local & remote-composed classes correctly", async (t) => {
        const bundle = await rollup({
            input   : require.resolve(`./specimens/internal-external-composition/internal-external-composition.js`),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should be able to tree-shake results", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/tree-shaking.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                }),
                { assets : false, code : true },
            )
        );
    });

    it("should generate CSS", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                }),
                { assets : true, code : false },
            )
        );
    });

    it("should handle assetFileNames being undefined", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                }),
                { assets : true, code : false },
            )
        );
    });

    it("should correctly pass to/from params for relative paths", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/relative-paths.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                    file : prefix(`./output/relative-paths/relative-paths.js`),
                }),
                { assets : true, code : false },
            )
        );
    });

    it("should correctly handle hashed output", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames : "assets/[name]-[hash][extname]",
                })
            )
        );
    });

    it("should correctly handle hashed output with external source maps & json files", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                createPlugin({
                    map  : { inline : false },
                    json : true,
                }),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames : "assets/[name]-[hash][extname]",
                })
            )
        );
    });

    it("should avoid generating empty CSS", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/no-css.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                }),
                { assets : true, code : false },
            )
        );
    });

    it("should ignore external modules", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/external.js"),
            plugins : [
                createPlugin(),
            ],
            external : [
                require.resolve("./specimens/simple.js"),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                }),
                { assets : true, code : false },
            )
        );
    });

    it("should output unreferenced CSS", async (t) => {
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

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                }),
                { assets : true, code : false },
            )
        );
    });

    it("should output assets with a .css file extension", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/file-extension/entry.js"),
            plugins : [
                createPlugin({
                    include : /\.cssx$/,
                }),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should respect the CSS dependency tree", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/dependencies.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should support namespaced @value imports", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/namespaced/namespaced.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should support external @value aliases", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/external-value-aliasing/external-value-aliasing.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should support mixing all @value types", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/all-value-types/all-value-types.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should support multiple selectors", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/multi-selector/multi-selector.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should support @value and class overlap", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/class-value-overlap/class-value-overlap.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should support @value camelCase overlap", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/value-camel-overlap.js"),
            plugins : [
                createPlugin(),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    it("should output classes in topological order", async (t) => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/topological-order/topological-order.js"),
            plugins : [
                createPlugin({ namer }),
            ],
        });

        t.assert.snapshot(
            rollupBundle(
                await bundle.generate({
                    format,
                    assetFileNames,
                })
            )
        );
    });

    describe("dev mode option", () => {
        it("should output a proxy", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        dev : true,
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                    }),
                    { assets : false, code : true },
                )
            );
        });
    });

    describe("json option", () => {
        it("should generate JSON", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        json : true,
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,
                    }),
                    { assets : true, code : false },
                )
            );
        });

        it("should generate JSON with a custom name", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        json : "custom.json",
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,
                    }),
                    { assets : true, code : false },
                )
            );
        });
    });

    describe("Exports option", () => {
        // Standard serializer for snapshots that makes the message id a relative filepath, so it doesn't
        // blow up on the build server
        const serializers = [ (value) => {
            value.id = relative(value.id)[0];

            return JSON.stringify(value, null, 2);
        } ];

        it("should provide named exports by default", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/named.js"),
                plugins : [
                    createPlugin(),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                    }),
                    { assets : false, code : true },
                )
            );
        });

        it("should warn & rewrite invalid identifiers (namedExports.rewriteInvalid = true)", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/invalid-name.js"),
                onwarn  : (msg) => t.assert.snapshot(msg, { serializers }),
                plugins : [
                    createPlugin({
                        namedExports : {
                            rewriteInvalid : true,
                        },
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,
                    }),
                    { assets : false, code : true },
                )
            );
        });

        it("should warn & ignore invalid identifiers (namedExports.rewriteInvalid = false)", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/invalid-name.js"),
                onwarn  : (msg) => t.assert.snapshot(msg, { serializers }),
                plugins : [
                    createPlugin({
                        namedExports : {
                            rewriteInvalid : false,
                        },
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,
                    }),
                    { assets : false, code : true },
                )
            );
        });

        it("should warn if named exports are falsey", async (t) => {
            const spy = logSpy("warn");

            await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        namedExports : false,
                    }),
                ],
            });

            t.assert.snapshot(logSpyCalls(spy));
        });

        it("should generated valid JS even when identifiers aren't", async (t) => {
            logSpy("warn");

            const bundle = await rollup({
                input   : require.resolve("./specimens/composes-from-invalid-js/entry.js"),
                plugins : [
                    createPlugin(),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                    }),
                    { assets : false, code : true },
                )
            );
        });
        
        it("should generate valid composition output when global() is used", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/composes-from-global/entry.js"),
                plugins : [
                    createPlugin(),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                    }),
                    { assets : false, code : true },
                )
            );
        });
    });

    describe("styleExport option", () => {
        it("should provide style export", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/style-export.js"),
                plugins : [
                    createPlugin({
                        styleExport : true,
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                    }),
                    { assets : false, code : true },
                )
            );
        });

        it("should warn that styleExport and done aren't compatible", async (t) => {
            const spy = logSpy("warn");

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

            t.assert.snapshot(logSpyCalls(spy));
        });
    });

    describe("source maps", () => {
        it("should generate external source maps", async (t) => {
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
            // TODO: ???
            // expect(JSON.parse(read("./external-source-maps/assets/simple.css.map"))).toMatchSnapshot({
            //     file : expect.any(String),
            // });

            t.assert.snapshot(read("./external-source-maps/assets/simple.css"));
        });


        it("shouldn't disable sourcemap generation", async (t) => {
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
            t.assert.snapshot(output.find((chunk) => chunk.map).map);
        });

        it("should not output sourcemaps when they are disabled", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                    }),
                ],
            });

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        assetFileNames,
                        format,
                    })
                )
            );
        });
    });

    describe("processor option", () => {
        it("should accept an existing processor instance", async (t) => {
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

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,

                        file : prefix(`./output/existing-processor/existing-processor.js`),
                    }),
                    { assets : true, code : false },
                )
            );
        });

        it("should accept an existing processor instance (no css in bundle)", async (t) => {
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

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,

                        file : prefix(`./output/existing-processor-no-css/existing-processor-no-css.js`),
                    }),
                    { assets : true, code : false },
                )
            );
        });
    });

    describe("verbose option", () => {
        it("should log in verbose mode", async (t) => {
            const spy = logSpy();

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

            t.assert.snapshot(logSpyCalls(spy));
        });
    });

    describe("empties option", () => {
        it("should write out empty CSS files when empties is enabled", async (t) => {
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

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,
                    }),
                    { assets : true, code : false },
                )
            );
        });

        it("should not write out empty CSS files by default", async (t) => {
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

            t.assert.snapshot(
                rollupBundle(
                    await bundle.generate({
                        format,
                        assetFileNames,
                    }),
                    { assets : true, code : false },
                )
            );
        });
    });

    describe("case sensitivity tests", () => {
        const fs = require("fs");
        let skip = false;

        // Verify that filesystem is case-insensitive before bothering
        fs.writeFileSync("./packages/rollup/test/output/sensitive.txt", "");

        try {
            fs.statSync("./packages/rollup/test/output/SENSITIVE.txt");
        } catch(e) {
            skip = true;
        }

        it("should warn about repeated references that point at the same files", { skip }, async (t) => {
            const spy = logSpy("warn");

            const bundle = await rollup({
                input   : require.resolve("./specimens/casing/main.js"),
                plugins : [
                    createPlugin(),
                ],
            });

            await bundle.write({
                format,
                assetFileNames,
                file : prefix(`./output/casing/main.js`),
            });

            t.assert.ok(spy.calls.length > 1);
        });
    });

    describe("errors", () => {
        it("should show useful CSS error messages", async (t) => {
            await t.assert.rejects(() =>
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

                        createPlugin({ namer }),
                    ],
                }),
                /.wooga/,
            );
        });

         
        it("should throw errors in in before plugins", async (t) => {
            await t.assert.rejects(() =>
                rollup({
                    input   : require.resolve("./specimens/simple.js"),
                    plugins : [
                        createPlugin({
                            css    : prefix(`./output/errors.css`),
                            before : [ error ],
                        }),
                    ],
                }),
                /error-plugin:/,
            );
        });

         
        it("should throw errors in after plugins", async (t) => {
            const bundle = await rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    createPlugin({
                        css   : prefix(`./output/errors.css`),
                        after : [ error ],
                    }),
                ],
            });

            await t.assert.rejects(() =>
                bundle.generate({ format }),
                /error-plugin:/,
            );
        });

        // Skipped because I can't figure out how to catch the error being thrown?
        it("should throw errors in done plugins", { skip : true }, () =>
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
