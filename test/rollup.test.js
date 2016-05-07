"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    rollup   = require("rollup").rollup,
    
    plugin = require("../src/rollup"),
    
    compare = require("./lib/compare-files"),
    wait    = require("./lib/wait");

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
            
            assert.equal(
                out.code + "\n",
                fs.readFileSync("./test/results/rollup/simple.js", "utf8")
            );
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
            
            assert.equal(
                out.code + "\n",
                fs.readFileSync("./test/results/rollup/tree-shaking.js", "utf8")
            );
        });
    });
    
    it("should generate CSS", function() {
        rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({
                    css : "./test/output/rollup/simple.css"
                })
            ]
        })
        .then(function(bundle) {
            // Have to call this so the output fn is invoked
            bundle.generate();
            
            // And since that's sync, but generation isn't, this is necessary...
            return wait("./test/output/rollup/simple.css").then(function() {
                compare.results("rollup/simple.css");
            });
        });
    });
    
    it("should generate JSON", function() {
        rollup({
            entry   : "./test/specimens/rollup/simple.js",
            plugins : [
                plugin({
                    json : "./test/output/rollup/simple.json"
                })
            ]
        })
        .then(function(bundle) {
            // Have to call this so the output fn is invoked
            bundle.generate();
            
            // And since that's sync, but generation isn't, this is necessary...
            return wait("./test/output/rollup/simple.json").then(function() {
                compare.results("rollup/simple.json");
            });
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
            
            assert.equal(
                out.code + "\n",
                fs.readFileSync("./test/results/rollup/invalid-name.js", "utf8")
            );
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
                    mappings : ";;;;;ACEA,OAAO,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC;AACjB,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC",
                    names    : [],
                    sources  : [
                        path.resolve(__dirname, "./specimens/rollup/simple.css").replace(/\\/g, "/"),
                        path.resolve(__dirname, "./specimens/rollup/simple.js").replace(/\\/g, "/")
                    ],
                    
                    sourcesContent : [
                        ".fooga {\n    color: red;\n}\n",
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
                    sourceMap : false,
                    css       : "./test/output/rollup/no-maps.css"
                })
            ]
        })
        .then(function(bundle) {
            var out = bundle.generate({ sourceMap : false });
            
            assert.equal(out.map, null);
            
            // And since that's sync, but generation isn't, this is necessary...
            return wait("./test/output/rollup/no-maps.css").then(function() {
                compare.results("rollup/no-maps.css");
            });
        });
    });
});
