/* eslint consistent-return: off */
"use strict";

const fs = require("fs");

const rollup = require("rollup").rollup;
const dedent = require("dedent");
const shell  = require("shelljs");

const read   = require("test-utils/read.js")(__dirname);
const exists = require("test-utils/exists.js")(__dirname);
const namer  = require("test-utils/namer.js");

const plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

function watching(cb) {
    var count = 0;

    return (details) => {
        if(details.code === "ERROR" || details.code === "FATAL") {
            throw details.error;
        }

        if(details.code !== "END") {
            return;
        }

        count++;

        cb(count, details);
    };
}

error.postcssPlugin = "error-plugin";

const assetFileNames = "assets/[name][extname]";
const format = "es";
const map = false;
const sourcemap = false;

describe("/rollup.js", () => {
    /* eslint max-statements: "off" */
    
    afterEach(() => shell.rm("-rf", "./packages/rollup/test/output/*"));
    
    it("should be a function", () =>
        expect(typeof plugin).toBe("function")
    );
    
    it("should generate exports", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => bundle.generate({ format }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );
    
    it("should be able to tree-shake results", () =>
        rollup({
            input   : require.resolve("./specimens/tree-shaking.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => bundle.generate({ format }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );

    it("should generate CSS", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map,
                })
            ]
        });

        await bundle.write({
            format,
            assetFileNames,
            file : "./packages/rollup/test/output/simple.js",
        });

        expect(read("assets/simple.css")).toMatchSnapshot();
    });

    it("should avoid generating empty CSS", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/no-css.js"),
            plugins : [
                plugin({
                    namer,
                })
            ]
        });

        await bundle.write({
            format,
            assetFileNames,
            file : "./packages/rollup/test/output/no-css.js",
        });

        expect(exists("assets/no-css.css")).toBe(false);
    });
    
    it("should generate JSON", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    json : true
                })
            ]
        })
        .then((bundle) => bundle.write({
            format,
            assetFileNames,
            file : "./packages/rollup/test/output/simple.js",
        }))
        .then(() =>
            expect(read("assets/simple.json")).toMatchSnapshot()
        )
    );

    it("should provide named exports", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/named.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
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
                        inline : false
                    }
                })
            ]
        });

        await bundle.write({
            format,
            assetFileNames,
            file : "./packages/rollup/test/output/simple.js",
        });

        // Have to parse it into JSON so the propertyMatcher can exclude the file property
        // since it is a hash value and changes constantly
        expect(JSON.parse(read("assets/simple.css.map"))).toMatchSnapshot({
            file : expect.any(String)
        });
    });
    
    it("should warn & not export individual keys when they are not valid identifiers", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/invalid-name.js"),
            onwarn  : (msg) => expect(msg).toMatchSnapshot({ id : expect.any(String) }),
            plugins : [
                plugin({
                    namer,
                })
            ]
        });

        const result = await bundle.generate({
            format,
            assetFileNames
        });

        expect(result.code).toMatchSnapshot();
    });

    it("should allow disabling of named exports", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    namedExports : false
                })
            ]
        });

        const result = await bundle.generate({
            format,
            assetFileNames
        });

        expect(result.code).toMatchSnapshot();
    });
    
    it("shouldn't disable sourcemap generation", async () => {
        const bundle = await rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    sourcemap : true
                })
            ]
        });

        const result = await bundle.generate({
            format,
            assetFileNames,

            sourcemap : true
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
                })
            ]
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

            file : "./packages/rollup/test/output/no-maps.js",
        });
        
        expect(read("assets/no-maps.css")).toMatchSnapshot();
    });

    it("should respect the CSS dependency tree", () =>
        rollup({
            input   : require.resolve("./specimens/dependencies.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => bundle.generate({ format }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );

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
                        css    : "./packages/rollup/test/output/errors.css",
                        before : [ error ]
                    })
                ]
            })
            .catch(checkError)
        );

        it("should throw errors in after plugins", () =>
            rollup({
                input   : require.resolve("./specimens/simple.js"),
                plugins : [
                    plugin({
                        namer,
                        css   : "./packages/rollup/test/output/errors.css",
                        after : [ error ]
                    })
                ]
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
                        css  : "./packages/rollup/test/output/errors.css",
                        done : [ error ]
                    })
                ]
            })
            .then((bundle) => bundle.write({
                format,
                file : "./packages/rollup/test/output/done-error.js"
            }))
        );
    });

    describe("watch", () => {
        var watch = require("rollup").watch,
            watcher;

        afterEach(() => watcher.close());
        
        it("should generate correct builds in watch mode when files change", (done) => {
            // Create v1 of the file
            fs.writeFileSync(
                "./packages/rollup/test/output/watched.css",
                ".one { color: red; }"
            );

            // Start watching
            watcher = watch({
                input  : require.resolve("./specimens/watch.js"),
                output : {
                    file : "./packages/rollup/test/output/watch-output.js",
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    })
                ]
            });

            // Create v2 of the file after a bit
            setTimeout(() => fs.writeFileSync(
                "./packages/rollup/test/output/watched.css",
                ".two { color: blue; }"
            ), 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should correctly update files within the dependency graph in watch mode when files change", (done) => {
            // Create v1 of the files
            fs.writeFileSync("./packages/rollup/test/output/one.css", dedent(`
                .one {
                    color: red;
                }
            `));

            fs.writeFileSync("./packages/rollup/test/output/two.css", dedent(`
                .two {
                    composes: one from "./one.css";
                    
                    color: blue;
                }
            `));
            
            fs.writeFileSync("./packages/rollup/test/output/watch.js", dedent(`
                import css from "./two.css";
                console.log(css);
            `));

            // Start watching
            watcher = watch({
                input  : require.resolve("./output/watch.js"),
                output : {
                    file : "./packages/rollup/test/output/watch-output.js",
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    })
                ]
            });

            // Create v2 of the file after a bit
            setTimeout(() => fs.writeFileSync("./packages/rollup/test/output/one.css", dedent(`
                .one {
                    color: green;
                }
            `)), 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(read("assets/watch-output.css")).toMatchSnapshot();

                    // continue watching
                    return;
                }

                expect(read("assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });

        it("should correctly add new css files in watch mode when files change", (done) => {
            // Create v1 of the files
            fs.writeFileSync(
                "./packages/rollup/test/output/one.css",
                dedent(`
                    .one {
                        color: red;
                    }
                `)
            );

            fs.writeFileSync(
                "./packages/rollup/test/output/watch.js",
                dedent(`
                    console.log("hello");
                `)
            );

            // Start watching
            watcher = watch({
                input  : require.resolve("./output/watch.js"),
                output : {
                    file : "./packages/rollup/test/output/watch-output.js",
                    format,
                    assetFileNames,
                },
                plugins : [
                    plugin({
                        map,
                    })
                ]
            });

            // Create v2 of the file after a bit
            setTimeout(() => fs.writeFileSync(
                "./packages/rollup/test/output/watch.js",
                dedent(`
                    import css from "./one.css";

                    console.log(css);
                `)
            ), 200);
            
            watcher.on("event", watching((builds) => {
                if(builds === 1) {
                    expect(exists("assets/watch-output.css")).toBe(false);

                    // continue watching
                    return;
                }

                expect(read("assets/watch-output.css")).toMatchSnapshot();

                return done();
            }));
        });
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
                    })
                ]
            });
    
            await bundle.write({
                format,

                assetFileNames,
                chunkFileNames,
                
                dir : "./packages/rollup/test/output/"
            });

            expect(read("assets/chunk.css")).toMatchSnapshot();
            expect(read("assets/dependencies.css")).toMatchSnapshot();
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
                        require.resolve("./specimens/manual-chunks/c.js")
                    ]
                },

                plugins : [
                    plugin({
                        namer,
                        map,
                    })
                ]
            });

            await bundle.write({
                format,

                assetFileNames,
                chunkFileNames,

                dir : "./packages/rollup/test/output/"
            });

            expect(read("assets/a.css")).toMatchSnapshot();
            expect(read("assets/b.css")).toMatchSnapshot();
            expect(read("assets/shared.css")).toMatchSnapshot();
        });

        it.only("should support dynamic imports", async () => {
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
                    })
                ]
            });

            await bundle.write({
                format,

                assetFileNames,
                chunkFileNames,

                dir : "./packages/rollup/test/output/"
            });

            expect(read("assets/a.css")).toMatchSnapshot();
            expect(read("assets/b.css")).toMatchSnapshot();
            expect(read("assets/c.css")).toMatchSnapshot();
            expect(read("assets/chunk.css")).toMatchSnapshot();
        });
    });
});
