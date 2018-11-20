/* eslint max-statements: "off" */
"use strict";

const { rollup } = require("rollup");

const dedent = require("dedent");
const shell = require("shelljs");

const read    = require("@modular-css/test-utils/read.js")(__dirname);
const readdir = require("@modular-css/test-utils/read-dir.js")(__dirname);
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
    beforeAll(() => shell.rm("-rf", prefix("./output/rollup/*")));
    
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
            file : prefix(`./output/rollup/css/simple.js`),
        });

        expect(read("./rollup/css/assets/simple.css")).toMatchSnapshot();
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
            file : prefix(`./output/rollup/relative-paths/relative-paths.js`),
        });

        expect(read("./rollup/relative-paths/assets/relative-paths.css")).toMatchSnapshot();
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
            file : prefix(`./output/rollup/no-css/no-css.js`),
        });

        expect(exists("./output/rollup/no-css/assets/no-css.css")).toBe(false);
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
            file : prefix(`./output/rollup/json/simple.js`),
        });
        
        expect(read("./rollup/json/assets/exports.json")).toMatchSnapshot();
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
            file : prefix(`./output/rollup/json-named/simple.js`),
        });
        
        expect(read("./rollup/json-named/assets/custom.json")).toMatchSnapshot();
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

        expect(result.code).toMatchSnapshot();
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
            file : prefix(`./output/rollup/external-source-maps/simple.js`),
        });

        // Have to parse it into JSON so the propertyMatcher can exclude the file property
        // since it is a hash value and changes constantly
        expect(JSON.parse(read("./rollup/external-source-maps/assets/simple.css.map"))).toMatchSnapshot({
            file : expect.any(String),
        });

        expect(read("./rollup/external-source-maps/assets/simple.css")).toMatchSnapshot();
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

            file : prefix(`./output/rollup/no-maps/no-maps.js`),
        });
        
        expect(read("./rollup/no-maps/assets/no-maps.css")).toMatchSnapshot();
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

            file : prefix(`./output/rollup/dependencies/dependencies.js`),
        });

        expect(read("./rollup/dependencies/dependencies.js")).toMatchSnapshot();
        expect(read("./rollup/dependencies/assets/dependencies.css")).toMatchSnapshot();
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
            
            file : prefix(`./output/rollup/existing-processor/existing-processor.js`),
        });

        expect(read("./rollup/existing-processor/assets/existing-processor.css")).toMatchSnapshot();
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
            
            file : prefix(`./output/rollup/repeated-references/repeated-references.js`),
        });

        expect(read("./rollup/repeated-references/repeated-references.js")).toMatchSnapshot();
        expect(read("./rollup/repeated-references/assets/repeated-references.css")).toMatchSnapshot();
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

        expect(result.code).toMatchSnapshot();
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

        fn("should remove repeated references that point at the same files", async () => {
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
                file : prefix(`./output/rollup/casing/main.js`),
            });

            expect(readdir("./rollup/casing")).toMatchSnapshot();
        });
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
                        css    : prefix(`./output/rollup/errors.css`),
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
                        css   : prefix(`./output/rollup/errors.css`),
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
                        css  : prefix(`./output/rollup/errors.css`),
                        done : [ error ],
                    }),
                ],
            })
            .then((bundle) => bundle.write({
                format,
                file : prefix(`./output/rollup/done-error.js`),
            }))
        );
    });
});
