"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    rollup = require("rollup").rollup,
    
    plugin = require("../src/rollup"),
    
    compare = require("./lib/compare-files");

describe("modular-css", function() {
    describe("rollup plugin", function() {
        after(function(done) {
            require("rimraf")("./test/output/rollup", done);
        });
        
        it("should be a function", function() {
            assert.equal(typeof plugin, "function");
        });
        
        it("should generate exports", function(done) {
            rollup({
                entry   : "./test/specimens/rollup/simple.js",
                plugins : [
                    plugin()
                ]
            }).then(
                function(bundle) {
                    var out = bundle.generate();
                    
                    assert.equal(
                        out.code + "\n",
                        fs.readFileSync("./test/results/rollup/simple.js", "utf8")
                    );
                    
                    done();
                }
            ).catch(done);
        });
        
        it("should generate CSS", function(done) {
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
                
                // And since that's "sync", but generation isn't, this is necessary...
                // UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH UGH
                setTimeout(function() {
                    compare.results("rollup/simple.css");
                        
                    done();
                }, 100);
            })
            .catch(done);
        });
    });
});
