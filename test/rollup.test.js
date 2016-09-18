"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    rollup = require("rollup").rollup,
    
    plugin  = require("../src/rollup"),
    compare = require("./lib/compare-files"),
    warn    = require("./lib/warn");

describe("/rollup.js", function() {
    after(function(done) {
        require("rimraf")("./test/output/rollup", done);
    });
    
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
        .then(function(bundle) {
            var out = bundle.generate();
            
            compare.stringToFile(out.code, "./test/results/rollup/simple.js");
        });
    });
    
    it("should be able to tree-shake results", function() {
        return rollup({
            entry   : "./test/specimens/rollup/tree-shaking.js",
            plugins : [
                plugin()
            ]
        })
        .then(function(bundle) {
            var out = bundle.generate();
            
            compare.stringToFile(out.code, "./test/results/rollup/tree-shaking.js");
        });
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
        .then(function(bundle) {
            var out = bundle.generate();

            assert.equal(typeof out.css.then, "function");
        });
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
        .then(function(bundle) {
            return bundle.write({
                dest : "./test/output/rollup/simple.js"
            });
        })
        .then(function() {
            compare.results("rollup/simple.css");
        });
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
        .then(function(bundle) {
            return bundle.write({
                dest : "./test/output/rollup/simple.js"
            });
        })
        .then(function() {
            compare.results("rollup/simple.json");
        });
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
        .then(function(bundle) {
            var out = bundle.generate();
            
            compare.stringToFile(out.code, "./test/results/rollup/invalid-name.js");
        });
    });
    
    it("shouldn't disable sourcemap generation", function() {
        return rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({ sourceMap : true })
            ]
        })
        .then(function(bundle) {
            var out = bundle.generate({ sourceMap : true });
            
            assert.deepEqual(
                out.map,
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
            );
        });
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
        .then(function(bundle) {
            var out = bundle.generate({ sourceMap : false });
            
            assert.equal(out.map, null);

            return bundle.write({
                dest      : "./test/output/rollup/no-maps.js",
                sourceMap : false
            });
        })
        .then(function() {
            compare.results("rollup/no-maps.css");
        });
    });

    describe("errors", function() {
        function checkError(error) {
            assert(error.toString().indexOf("Warning Plugin: warning") > -1);
        }

        it("should throw errors in in before plugins", function() {
            return rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin({
                        css    : "./test/output/rollup/errors.css",
                        before : [ warn ]
                    })
                ]
            })
            .then(function(bundle) {
                assert.fail("Shouldn't have succeeded")
            })
            .catch(checkError);
        });

        it("should throw errors in after plugins", function() {
            return rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin({
                        css   : "./test/output/rollup/errors.css",
                        after : [ warn ]
                    })
                ]
            })
            .then(function(bundle) {
                var out = bundle.generate({});

                return out.css;
            })
            .then(function(result) {
                assert.fail("Shouldn't have succeeded");
            })
            .catch(checkError);
        });

        it("should throw errors in done plugins", function() {
            return rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin({
                        css  : "./test/output/rollup/errors.css",
                        done : [ warn ]
                    })
                ]
            })
            .then(function(bundle) {
                return bundle.write({
                    dest : "./test/output/rollup/done-error.js"
                });
            })
            .catch(checkError);
        });
    });
});
