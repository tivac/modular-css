"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    
    plugin = require("../src/browserify");

describe("postcss-modular-css", function() {
    describe("browserify plugin", function() {
        it("should error if an invalid extension is applied", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.on("error", function(err) {
                assert.equal(err, "Missing or invalid \"ext\" option: false");

                done();
            });

            build.plugin(plugin, { ext : false });
        });

        it("should replace require() calls with the exported identifiers", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin);
            
            build.bundle(function(err, out) {
                assert.ifError(err);
                assert(out.toString().indexOf(fs.readFileSync("./test/results/browserify-export-identifiers.js", "utf8")) > -1);

                done();
            });
        });

        it("should include all CSS dependencies in output css", function(done) {
            var build = browserify("./test/specimens/start.js");
            
            build.plugin(plugin, { css : "./test/output/browserify-include-css-deps.css" });
            
            build.bundle(function(err, out) {
                assert.ifError(err);

                assert(out.toString().indexOf(fs.readFileSync("./test/results/browserify-include-css-deps.js", "utf8")) > -1);

                // Wrapped because browserify event lifecycle is... odd
                setImmediate(function() {
                    assert.equal(
                        fs.readFileSync("./test/output/browserify-include-css-deps.css", "utf8"),
                        fs.readFileSync("./test/results/browserify-include-css-deps.css", "utf8")
                    );
                    
                    done();
                });
            });
        });

        it("should write out the complete exported identifiers when `json` is specified", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin, { json : "./test/output/browserify-export-all-identifiers.json" });
            
            build.bundle(function(err) {
                assert.ifError(err);

                // Wrapped because browserify event lifecycle is... odd
                setImmediate(function() {
                    assert.equal(
                        fs.readFileSync("./test/output/browserify-export-all-identifiers.json", "utf8"),
                        fs.readFileSync("./test/results/browserify-export-all-identifiers.json", "utf8")
                    );

                    done();
                });
            });
        });

        it("should not include duplicate files in the output multiple times via browserify", function(done) {
            var build = browserify("./test/specimens/duplication.js");
            
            build.plugin(plugin, { css : "./test/output/browserify-avoid-duplicates.css" });
            
            build.bundle(function(err, out) {
                assert.ifError(err);
                assert(out.toString().indexOf(fs.readFileSync("./test/results/browserify-avoid-duplicates-local.js", "utf8")) > -1);
                assert(out.toString().indexOf(fs.readFileSync("./test/results/browserify-avoid-duplicates-start.js", "utf8")) > -1);

                // Wrapped because browserify event lifecycle is... odd
                setImmediate(function() {
                    assert.equal(
                        fs.readFileSync("./test/output/browserify-avoid-duplicates.css", "utf8"),
                        fs.readFileSync("./test/output/browserify-avoid-duplicates.css", "utf8")
                    );
                    
                    done();
                });
            });
        });
    });
});
