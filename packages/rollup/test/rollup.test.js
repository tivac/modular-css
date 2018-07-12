/* eslint max-statements: "off" */
"use strict";

const path = require("path");

const { rollup } = require("rollup");

const dedent = require("dedent");
const shell  = require("shelljs");

const output = path.resolve(__dirname, "./output/rollup");

const read     = require("test-utils/read.js")(output);
const exists   = require("test-utils/exists.js")(output);
const namer    = require("test-utils/namer.js");

const Processor = require("modular-css-core");

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
    beforeAll(() => shell.rm("-rf", `${output}/*`));
    
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
        
        expect(result.code).toMatchSnapshot();
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
        
        expect(result.code).toMatchSnapshot();
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
            file : `${output}/css/simple.js`,
        });

        expect(read("css/assets/simple.css")).toMatchSnapshot();
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
            file : `${output}/assetFileNames/simple.js`,
        });

        const [ css ] = shell.ls(`${output}/assetFileNames/assets`);

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
            file : `${output}/relative-paths/relative-paths.js`,
        });

        expect(read("relative-paths/assets/relative-paths.css")).toMatchSnapshot();
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
            file : `${output}/no-css/no-css.js`,
        });

        expect(exists("no-css/assets/no-css.css")).toBe(false);
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
            file : `${output}/json/simple.js`,
        });
        
        expect(read("json/assets/simple.json")).toMatchSnapshot();
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

        expect(result.code).toMatchSnapshot();
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
            file : `${output}/external-source-maps/simple.js`,
        });

        // Have to parse it into JSON so the propertyMatcher can exclude the file property
        // since it is a hash value and changes constantly
        expect(JSON.parse(read("external-source-maps/assets/simple.css.map"))).toMatchSnapshot({
            file : expect.any(String),
        });
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

        expect(result.code).toMatchSnapshot();
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

        expect(result.code).toMatchSnapshot();
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

        const result = await bundle.generate({
            format,
            assetFileNames,

            sourcemap : true,
        });

        expect(result.map).toMatchSnapshot();
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

        const source = await bundle.generate({
            format,
            assetFileNames,
            sourcemap,
        });

        expect(source.map).toBe(null);

        await bundle.write({
            assetFileNames,
            format,
            sourcemap,

            file : `${output}/no-maps/no-maps.js`,
        });
        
        expect(read("no-maps/assets/no-maps.css")).toMatchSnapshot();
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

            file : `${output}/dependencies/dependencies.js`,
        });

        expect(read("dependencies/dependencies.js")).toMatchSnapshot();
        expect(read("dependencies/assets/dependencies.css")).toMatchSnapshot();
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

        await bundle.write({
            format,
            sourcemap,
            assetFileNames,
            
            file : `${output}/existing-processor/existing-processor.js`,
        });

        expect(read("existing-processor/assets/existing-processor.css")).toMatchSnapshot();
        expect(read("existing-processor/assets/common.css")).toMatchSnapshot();
    });

    it("shouldn't over-remove files from an existing processor instance", async () => {
        const processor = new Processor({
            namer,
            map,
        });

        await processor.file(require.resolve("./specimens/repeated-references/b.css"));
        
        const bundle = await rollup({
            input   : require.resolve("./specimens/repeated-references/a.js"),
            plugins : [
                plugin({
                    processor,
                }),
            ],
        });

        await bundle.write({
            format,
            sourcemap,
            assetFileNames,
            
            file : `${output}/repeated-references/repeated-references.js`,
        });

        expect(read("repeated-references/repeated-references.js")).toMatchSnapshot();
        expect(read("repeated-references/assets/repeated-references.css")).toMatchSnapshot();
        expect(read("repeated-references/assets/common.css")).toMatchSnapshot();
    });

    describe("errors", () => {
        function checkError(err) {
            expect(err.toString()).toMatch("error-plugin:");
        }

        it("should throw errors in in before plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    plugin({
                        namer,
                        css    : `${output}/errors.css`,
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
                        css   : `${output}/errors.css`,
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
                        css  : `${output}/errors.css`,
                        done : [ error ],
                    }),
                ],
            })
            .then((bundle) => bundle.write({
                format,
                file : `${output}/done-error.js`,
            }))
        );
    });

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
                
                dir : `${output}/splitting`,
            });

            expect(read("splitting/assets/common.css")).toMatchSnapshot();
            expect(read("splitting/assets/dependencies.css")).toMatchSnapshot();
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

                dir : `${output}/manual-chunks`,
            });

            expect(read("manual-chunks/assets/a.css")).toMatchSnapshot();
            expect(read("manual-chunks/assets/b.css")).toMatchSnapshot();
            expect(read("manual-chunks/assets/common.css")).toMatchSnapshot();
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

                dir : `${output}/dynamic-imports`,
            });

            expect(read("dynamic-imports/assets/a.css")).toMatchSnapshot();
            expect(read("dynamic-imports/assets/b.css")).toMatchSnapshot();
            expect(read("dynamic-imports/assets/c.css")).toMatchSnapshot();
            expect(read("dynamic-imports/assets/common.css")).toMatchSnapshot();
        });
    });
});
