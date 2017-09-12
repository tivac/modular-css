"use strict";

var fs = require("fs"),

    rollup  = require("rollup").rollup,
    
    read  = require("test-utils/read.js")(__dirname),
    namer = require("test-utils/namer.js"),
    
    plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

describe("/rollup.js", () => {
    afterAll(() => require("shelljs").rm("-rf", "./packages/rollup/test/output/*"));
    
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
        .then((bundle) => bundle.generate({ format : "es" }))
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
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );

    it("should attach a promise to the bundle.generate response", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    css : "./packages/rollup/test/output/simple.css"
                })
            ]
        })
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(typeof result.css.then).toBe("function"))
    );
    
    it("should generate CSS", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    css : "./packages/rollup/test/output/simple.css"
                })
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            file   : "./packages/rollup/test/output/simple.js"
        }))
        .then(() =>
            expect(read("simple.css")).toMatchSnapshot()
        )
    );
    
    it("should generate JSON", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    json : "./packages/rollup/test/output/simple.json"
                })
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            file   : "./packages/rollup/test/output/simple.js"
        }))
        .then(() =>
            expect(read("simple.json")).toMatchSnapshot()
        )
    );

    it("should provide named exports", () =>
        rollup({
            input   : require.resolve("./specimens/named.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );
    
    it("should warn & not export individual keys when they are not valid identifiers", () =>
        rollup({
            input   : require.resolve("./specimens/invalid-name.js"),
            plugins : [
                plugin({
                    namer,
                    onwarn : (msg) =>
                        expect(msg).toBe("Invalid JS identifier \"fooga-wooga\", unable to export")
                })
            ]
        })
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );

    it("should allow disabling of named exports", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    namedExports : false
                })
            ]
        })
        .then((bundle) => bundle.generate({ format : "es" }))
        .then((result) => expect(result.code).toMatchSnapshot())
    );
    
    it("shouldn't disable sourcemap generation", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    sourcemap : true
                })
            ]
        })
        .then((bundle) => bundle.generate({
            format    : "es",
            sourcemap : true
        }))
        .then((result) => {
            var map = result.map;

            // Sources are absolute file paths, so prevent snapshot testing
            delete map.sources;
            
            expect(map).toMatchSnapshot();
        })
    );
    
    it("should not output sourcemaps when they are disabled", () =>
        rollup({
            input   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map : false,
                    css : "./packages/rollup/test/output/no-maps.css"
                })
            ]
        })
        .then((bundle) => Promise.all([
            bundle,
            bundle.generate({
                format    : "es",
                sourcemap : false
            })
        ]))
        .then((results) => {
            expect(results[1].map).toBe(null);

            return results[0].write({
                format    : "es",
                file      : "./packages/rollup/test/output/no-maps.js",
                sourcemap : false
            });
        })
        .then(() =>
            expect(read("no-maps.css")).toMatchSnapshot()
        )
    );

    it("should respect the CSS dependency tree", () =>
        rollup({
            input   : require.resolve("./specimens/dependencies.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => bundle.generate({ format : "es" }))
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
                format : "es",
                file   : "./packages/rollup/test/output/done-error.js"
            }))
            .catch(checkError)
        );
    });

    describe("watch", () => {
        var watcher;

        afterEach(() => watcher.close());
        
        it("should generate correct builds in watch mode when files change", (done) => {
            var builds = 0;
            
            // Create v1 of the file
            fs.writeFileSync(
                "./packages/rollup/test/output/watched.css",
                ".one { color: red; }"
            );

            // Start watching (re-requiring rollup because it needs root obj reference)
            watcher = require("rollup").watch({
                input  : require.resolve("./specimens/watch.js"),
                output : {
                    file   : "./packages/rollup/test/output/watch.js",
                    format : "es"
                },
                plugins : [
                    plugin({
                        css : "./packages/rollup/test/output/watch-output.css",
                        map : false
                    })
                ]
            });

            // Create v2 of the file after a bit
            setTimeout(() => fs.writeFileSync(
                "./packages/rollup/test/output/watched.css",
                ".two { color: blue; }"
            ), 200);
            
            watcher.on("event", (details) => {
                /* eslint consistent-return:0 */
                
                if(details.code !== "END") {
                    return;
                }

                builds++;
                
                // First build
                if(builds === 1) {
                    try {
                        expect(read("watch-output.css")).toMatchSnapshot();
                    } catch(e) {
                        return done(e);
                    }
                }

                // Second build
                if(builds > 1) {
                    try {
                        expect(read("watch-output.css")).toMatchSnapshot();
                    } catch(e) {
                        return done(e);
                    }

                    return done();
                }
            });
        });
    });
});
