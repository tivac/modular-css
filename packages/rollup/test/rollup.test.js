"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    rollup  = require("rollup").rollup,
    watch   = require("rollup-watch"),
    
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
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) =>
            expect(bundle.generate({ format : "es" }).code).toMatchSnapshot()
        )
    );
    
    it("should be able to tree-shake results", () =>
        rollup({
            entry   : require.resolve("./specimens/tree-shaking.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) =>
            expect(bundle.generate({ format : "es" }).code).toMatchSnapshot()
        )
    );

    it("should attach a promise to the bundle.generate response", () =>
        rollup({
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    css : "./packages/rollup/test/output/simple.css"
                })
            ]
        })
        .then((bundle) =>
            expect(
                typeof bundle.generate({ format : "es" }).css.then
            ).toBe("function")
        )
    );
    
    it("should generate CSS", () =>
        rollup({
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    css : "./packages/rollup/test/output/simple.css"
                })
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            dest   : "./packages/rollup/test/output/simple.js"
        }))
        .then(() =>
            expect(read("simple.css")).toMatchSnapshot()
        )
    );
    
    it("should generate JSON", () =>
        rollup({
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    json : "./packages/rollup/test/output/simple.json"
                })
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            dest   : "./packages/rollup/test/output/simple.js"
        }))
        .then(() =>
            expect(read("simple.json")).toMatchSnapshot()
        )
    );

    it("should provide named exports", () =>
        rollup({
            entry   : require.resolve("./specimens/named.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) =>
            expect(bundle.generate({ format : "es" }).code).toMatchSnapshot()
        )
    );
    
    it("should warn & not export individual keys when they are not valid identifiers", () =>
        rollup({
            entry   : require.resolve("./specimens/invalid-name.js"),
            plugins : [
                plugin({
                    namer,
                    onwarn : (msg) =>
                        assert(msg === "Invalid JS identifier \"fooga-wooga\", unable to export")
                })
            ]
        })
        .then((bundle) =>
            expect(bundle.generate({ format : "es" }).code).toMatchSnapshot()
        )
    );

    it("should allow disabling of named exports", () =>
        rollup({
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    namedExports : false
                })
            ]
        })
        .then((bundle) =>
            expect(bundle.generate({ format : "es" }).code).toMatchSnapshot()
        )
    );
    
    it("shouldn't disable sourcemap generation", () =>
        rollup({
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    sourceMap : true
                })
            ]
        })
        .then((bundle) => {
            var map = bundle.generate({
                format    : "es",
                sourceMap : true
            }).map;

            // Sources are absolute file paths, so prevent snapshot testing
            delete map.sources;
            
            expect(map).toMatchSnapshot();
        })
    );
    
    it("should not output sourcemaps when they are disabled", () =>
        rollup({
            entry   : require.resolve("./specimens/simple.js"),
            plugins : [
                plugin({
                    namer,
                    map : false,
                    css : "./packages/rollup/test/output/no-maps.css"
                })
            ]
        })
        .then((bundle) => {
            expect(
                bundle.generate({
                    format    : "es",
                    sourceMap : false
                }).map
            ).toBe(null);

            return bundle.write({
                format    : "es",
                dest      : "./packages/rollup/test/output/no-maps.js",
                sourceMap : false
            });
        })
        .then(() =>
            expect(read("no-maps.css")).toMatchSnapshot()
        )
    );

    it("should respect the CSS dependency tree", () =>
        rollup({
            entry   : require.resolve("./specimens/dependencies.js"),
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) =>
            expect(bundle.generate({ format : "es" }).code).toMatchSnapshot()
        )
    );

    describe("errors", () => {
        function checkError(err) {
            assert(err.toString().indexOf("error-plugin:") > -1);
        }

        it("should throw errors in in before plugins", () =>
            rollup({
                entry   : require.resolve("./specimens/simple.js"),
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
                entry   : require.resolve("./specimens/simple.js"),
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

        it("should throw errors in done plugins", () =>
            rollup({
                entry   : require.resolve("./specimens/simple.js"),
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
                dest   : "./packages/rollup/test/output/done-error.js"
            }))
            .catch(checkError)
        );
    });

    describe("watch", () => {
        var watcher;

        afterEach(() => watcher.close());
        
        it("should generate correct builds in watch mode when files change", (done) => {
            // Create v1 of the file
            fs.writeFileSync(
                "./packages/rollup/test/output/watched.css",
                ".one { color: red; }"
            );

            // Start watching (re-requiring rollup because it needs root obj reference)
            watcher = watch(require("rollup"), {
                entry   : require.resolve("./specimens/watch.js"),
                dest    : "./packages/rollup/test/output/watch.js",
                format  : "es",
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
                if(details.code === "BUILD_END" && details.initial) {
                    try {
                        expect(read("watch-output.css")).toMatchSnapshot();
                    } catch(e) {
                        return done(e);
                    }
                }

                if(details.code === "BUILD_END" && !details.initial) {
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
