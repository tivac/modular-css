"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    shell   = require("shelljs"),
    rollup  = require("rollup").rollup,
    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),
    
    plugin = require("../rollup.js");

function error(root) {
    throw root.error("boom");
}

error.postcssPlugin = "error-plugin";

describe("/rollup.js", function() {
    afterAll(() => require("shelljs").rm("-rf", "./packages/rollup/test/output/*"));
    
    it("should be a function", function() {
        expect(typeof plugin).toBe("function");
    });
    
    it("should generate exports", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/simple.js",
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./packages/rollup/test/results/simple.js"
        ));
    });
    
    it("should be able to tree-shake results", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/tree-shaking.js",
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./packages/rollup/test/results/tree-shaking.js"
        ));
    });

    it("should attach a promise to the bundle.generate response", function() {
          return rollup({
            entry   : "./packages/rollup/test/specimens/simple.js",
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
        );
    });
    
    it("should generate CSS", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/simple.js",
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
        .then(() => compare.results("simple.css"));
    });
    
    it("should generate JSON", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/simple.js",
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
        .then(() => compare.results("simple.json"));
    });
    
    it("should warn & not export individual keys when they are not valid identifiers", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/invalid-name.js",
            plugins : [
                plugin({
                    namer,
                    onwarn : function(msg) {
                        assert(msg === "Invalid JS identifier \"fooga-wooga\", unable to export");
                    }
                })
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./packages/rollup/test/results/invalid-name.js"
        ));
    });
    
    it("shouldn't disable sourcemap generation", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/simple.js",
            plugins : [
                plugin({
                    namer,
                    sourceMap : true
                })
            ]
        })
        .then((bundle) => expect(
            bundle.generate({
                format    : "es",
                sourceMap : true
            }).map
        ).toEqual({
            version  : 3,
            file     : null,
            mappings : ";;;;;AAEA,OAAO,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC;AACjB,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC",
            names    : [],
            sources  : [
                path.resolve(__dirname, "./specimens/simple.js").replace(/\\/g, "/")
            ],
            
            sourcesContent : [
                "import css, {fooga} from \"./simple.css\";\n\nconsole.log(css);\nconsole.log(fooga);\n"
            ]
        }));
    });
    
    it("should not output sourcemaps when they are disabled", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/simple.js",
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
        .then(() => compare.results("no-maps.css"));
    });

    it("should respect the CSS dependency tree", function() {
        return rollup({
            entry   : "./packages/rollup/test/specimens/dependencies.js",
            plugins : [
                plugin({
                    namer
                })
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./packages/rollup/test/results/dependencies.js"
        ));
    });

    describe("errors", function() {
        function checkError(err) {
            assert(err.toString().indexOf("error-plugin:") > -1);
        }

        it("should throw errors in in before plugins", function() {
            return rollup({
                entry   : "./packages/rollup/test/specimens/simple.js",
                plugins : [
                    plugin({
                        namer,
                        css    : "./packages/rollup/test/output/errors.css",
                        before : [ error ]
                    })
                ]
            })
            .catch(checkError);
        });

        it("should throw errors in after plugins", function() {
            return rollup({
                entry   : "./packages/rollup/test/specimens/simple.js",
                plugins : [
                    plugin({
                        namer,
                        css   : "./packages/rollup/test/output/errors.css",
                        after : [ error ]
                    })
                ]
            })
            .catch(checkError);
        });

        it("should throw errors in done plugins", function() {
            return rollup({
                entry   : "./packages/rollup/test/specimens/simple.js",
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
            .catch(checkError);
        });
    });

    describe("watch", function() {
        var watcher;

        after(() => watcher.close());
        
        it("should generate correct builds in watch mode when files change", function(done) {
            // Create v1 of the file
            fs.writeFileSync("./test/output/watched.css", ".one { color: red; }");

            // Start watching (re-requiring rollup because it needs root obj reference)
            watcher = watch(require("rollup"), {
                entry   : "./test/specimens/rollup/watch.js",
                dest    : "./test/output/watch.js",
                format  : "es",
                plugins : [
                    plugin({
                        css  : "./test/output/watch-output.css",
                        map  : false
                    })
                ]
            });

            // Create v2 of the file after a bit
            setTimeout(() => fs.writeFileSync("./test/output/watched.css", ".two { color: blue; }"), 200);
            
            watcher.on("event", (details) => {
                if(details.code === "BUILD_END" && details.initial) {
                    try {
                        compare.results(
                            "watch-output.css",
                            "rollup/watch1.css"
                        );
                    } catch(e) {
                        return done(e);
                    }
                }

                if(details.code === "BUILD_END" && !details.initial) {
                    try {
                        compare.results(
                            "watch-output.css",
                            "rollup/watch2.css"
                        );
                    } catch(e) {
                        return done(e);
                    }

                    return done();
                }
            });
        });
    });
});
