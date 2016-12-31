"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    rollup = require("rollup").rollup,
    
    plugin  = require("../src/rollup.js"),
    compare = require("./lib/compare.js"),
    warn    = require("./lib/warn.js");

function error(root, result) {
    throw root.error("boom");
};

error.postcssPlugin = "error-plugin";

describe("/rollup.js", function() {
    after(() => require("shelljs").rm("-rf", "./test/output/rollup"));
    
    it("should be a function", function() {
        assert.equal(typeof plugin, "function");
    });
    
    it("should generate exports", function() {
        return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin()
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./test/results/rollup/simple.js"
        ));
    });
    
    it("should be able to tree-shake results", function() {
        return rollup({
            entry   : "./test/specimens/rollup/tree-shaking.js",
            plugins : [
                plugin()
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./test/results/rollup/tree-shaking.js"
        ));
    });

    it("should attach a promise to the bundle.generate response", function() {
          return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({
                    css : "./test/output/rollup/simple.css"
                })
            ]
        })
        .then((bundle) => assert.equal(
            typeof bundle.generate({ format : "es" }).css.then,
            "function"
        ));
    });
    
    it("should generate CSS", function() {
        return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({
                    css : "./test/output/rollup/simple.css"
                })
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            dest   : "./test/output/rollup/simple.js"
        }))
        .then(() => compare.results("rollup/simple.css"));
    });
    
    it("should generate JSON", function() {
        return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({
                    json : "./test/output/rollup/simple.json"
                })
            ]
        })
        .then((bundle) => bundle.write({
            format : "es",
            dest   : "./test/output/rollup/simple.js"
        }))
        .then(() => compare.results("rollup/simple.json"));
    });
    
    it("should warn & not export individual keys when they are not valid identifiers", function() {
        return rollup({
            entry   : "./test/specimens/rollup/invalid-name.js",
            plugins : [
                plugin({
                    onwarn : function(msg) {
                        assert(msg === "Invalid JS identifier \"fooga-wooga\", unable to export");
                    }
                })
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./test/results/rollup/invalid-name.js"
        ));
    });
    
    it("shouldn't disable sourcemap generation", function() {
        return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({ sourceMap : true })
            ]
        })
        .then((bundle) => assert.deepEqual(
            bundle.generate({
                format    : "es",
                sourceMap : true
            }).map,
            {
                version  : 3,
                file     : null,
                mappings : ";;;;;AAEA,OAAO,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC;AACjB,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC",
                names    : [],
                sources  : [
                    path.resolve(__dirname, "./specimens/rollup/simple.js").replace(/\\/g, "/")
                ],
                
                sourcesContent : [
                    "import css, {fooga} from \"./simple.css\";\n\nconsole.log(css);\nconsole.log(fooga);\n"
                ]
            }
        ));
    });
    
    it("should not output sourcemaps when they are disabled", function() {
        return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({
                    map : false,
                    css : "./test/output/rollup/no-maps.css"
                })
            ]
        })
        .then((bundle) => {
            assert.equal(
                bundle.generate({
                    format    : "es",
                    sourceMap : false
                }).map,
                null
            );

            return bundle.write({
                format    : "es",
                dest      : "./test/output/rollup/no-maps.js",
                sourceMap : false
            });
        })
        .then(() => compare.results("rollup/no-maps.css"));
    });

    it("should respect the CSS dependency tree", function() {
        return rollup({
            entry   : "./test/specimens/rollup/dependencies.js",
            plugins : [
                plugin()
            ]
        })
        .then((bundle) => compare.stringToFile(
            bundle.generate({ format : "es" }).code,
            "./test/results/rollup/dependencies.js"
        ));
    });

    describe("errors", function() {
        function checkError(error) {
            assert(error.toString().indexOf("error-plugin:") > -1);
        }

        it("should throw errors in in before plugins", function() {
            return rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin({
                        css    : "./test/output/rollup/errors.css",
                        before : [ error ]
                    })
                ]
            })
            .catch(checkError);
        });

        it("should throw errors in after plugins", function() {
            return rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin({
                        css   : "./test/output/rollup/errors.css",
                        after : [ error ]
                    })
                ]
            })
            .catch(checkError);
        });

        it("should throw errors in done plugins", function() {
            return rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin({
                        css  : "./test/output/rollup/errors.css",
                        done : [ error ]
                    })
                ]
            })
            .then((bundle) => bundle.write({
                format : "es",
                dest   : "./test/output/rollup/done-error.js"
            }))
            .catch(checkError);
        });
    });
});
