"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    from       = require("from2-string"),
    
    plugin = require("../src/browserify"),
    
    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare-files");

describe("modular-css", function() {
    describe("browserify plugin", function() {
        after(function(done) {
            require("rimraf")("./test/output/browserify", done);
        });
        
        it("should error if an invalid extension is applied", function(done) {
            var build = browserify();
            
            build.on("error", function(err) {
                assert.equal(err, "Missing or invalid \"ext\" option: false");

                done();
            });

            build.plugin(plugin, { ext : false });
        });

        it("should error on invalid CSS", function(done) {
            var build  = browserify({
                    entries : from("require('./test/specimens/invalid.css');")
                }),
                errors = 0;
            
            build.plugin(plugin);

            build.bundle(function(err) {
                if(++errors === 2) {
                    return done();
                }

                assert(err);
                assert.equal(err.name, "CssSyntaxError");
                assert.equal(err.reason, "Invalid composes reference");
            });
        });

        it("should replace require() calls with the exported identifiers", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/simple.css');")
                });
            
            build.plugin(plugin);
            
            bundle(build, function(out) {
                assert(
                    out.indexOf(fs.readFileSync("./test/results/browserify/export-identifiers.js", "utf8")) > -1
                );

                done();
            });
        });

        it("should correctly rewrite urls based on the destination file", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/relative.css');")
                });
            
            build.plugin(plugin, {
                css : "./test/output/browserify/relative.css"
            });
            
            bundle(build, function() {
                compare.results("browserify/relative.css");
                
                done();
            });
        });

        it("should use the specified prefix", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/simple.css');")
                });
            
            build.plugin(plugin, {
                css    : "./test/output/browserify/prefix.css",
                prefix : "prefix"
            });
            
            bundle(build, function() {
                compare.results("browserify/prefix.css");
                
                done();
            });
        });

        it("should use the specified namer function", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/keyframes.css');")
                });
            
            build.plugin(plugin, {
                css   : "./test/output/browserify/namer-fn.css",
                namer : function(file, selector) {
                    return path.basename(file, path.extname(file)) + "-" + selector;
                }
            });
            
            bundle(build, function() {
                compare.results("browserify/namer-fn.css");
                
                done();
            });
        });

        it("should include all CSS dependencies in output css", function(done) {
            var build = browserify({
                    entries : from("require('./test/specimens/start.css');")
                });
            
            build.plugin(plugin, { css : "./test/output/browserify/include-css-deps.css" });
            
            bundle(build, function(out) {
                assert(out.indexOf(fs.readFileSync("./test/results/browserify/include-css-deps.js", "utf8")) > -1);

                compare.results("browserify/include-css-deps.css");
                
                done();
            });
        });

        it("should write out the complete exported identifiers when `json` is specified", function(done) {
            var build = browserify(from("require('./test/specimens/multiple.css');"));
            
            build.plugin(plugin, {
                json : "./test/output/browserify/export-all-identifiers.json"
            });
            
            bundle(build, function() {
                compare.results("browserify/export-all-identifiers.json");

                done();
            });
        });

        it("should not include duplicate files in the output multiple times", function(done) {
            var build = browserify(
                    from("require('./test/specimens/start.css'); require('./test/specimens/local.css');")
                );
            
            build.plugin(plugin, { css : "./test/output/browserify/avoid-duplicates.css" });
            
            bundle(build, function(out) {
                assert(out.indexOf(fs.readFileSync("./test/results/browserify/avoid-duplicates-local.js", "utf8")) > -1);
                assert(out.indexOf(fs.readFileSync("./test/results/browserify/avoid-duplicates-start.js", "utf8")) > -1);

                compare.results("browserify/avoid-duplicates.css");
                
                done();
            });
        });
    });
});
