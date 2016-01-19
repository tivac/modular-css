"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    shell      = require("shelljs"),
    from       = require("from2-string"),
    
    plugin = require("../src/browserify"),
    
    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare-files");

describe("modular-css", function() {
    describe("watchify", function() {
        describe("caching", function() {
            beforeEach(function() {
                shell.cp("-f", "./test/specimens/simple.css", "./test/specimens/watchify.css");
            });

            after(function() {
                shell.rm("./test/specimens/watchify.css");
            });

            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify({
                        entries : from("require('./watchify.css');"),
                        basedir : "./test/specimens"
                    });

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./test/output/watchify.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build, function() {
                        compare.result("watchify.css", "watchify-2.css");
                        
                        build.close();
                        
                        done();
                    });
                });

                // Run first bundle, start watching
                bundle(build, function() {
                    compare.result("watchify.css", "watchify-1.css");

                    shell.cp("-f", "./test/specimens/blue.css", "./test/specimens/watchify.css");
                });
            });
        });
        
        describe("error handling", function() {
            beforeEach(function() {
                shell.cp("-f", "./test/specimens/invalid.css", "./test/specimens/watchify.css");
            });

            after(function() {
                shell.rm("./test/specimens/watchify.css");
            });
        
            it("shouldn't explode on invalid CSS", function(done) {
                var build = browserify({
                        entries : from("require('./watchify.css');"),
                        basedir : "./test/specimens"
                    }),
                    wait;

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./test/output/watchify.css"
                });

                // File changed
                build.on("update", function() {
                    // Attempt to bundle again
                    bundle(build, function() {
                        compare.result("watchify.css", "watchify-2.css");
                        
                        build.close();
                        
                        done();
                    });
                });

                // Run first bundle to start watching
                build.bundle(function(err) {
                    // This one should fail, but not stop watchify from running
                    assert(err);
                    assert(err.name === "SyntaxError" || err.name === "CssSyntaxError");
                    
                    if(wait) {
                        return;
                    }
                    
                    // Wrapped because browserify event lifecycle is... odd
                    wait = setImmediate(function() {
                        shell.cp("-f", "./test/specimens/blue.css", "./test/specimens/watchify.css");
                    });
                });
            });
        });
        
        describe("caching", function() {
            var out = path.resolve("./test/__output.css"),
                rel = path.resolve("./test/results/watchify-relative.css");
            
            after(function() {
                shell.rm(out);
            });
            
            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify("./test/specimens/watchify-relative.js");

                build.plugin("watchify");
                build.plugin(plugin, {
                    // Generating to a weird spot to get bug to repro
                    css : out
                });

                // File changed
                build.on("update", function() {
                    bundle(build, function() {
                        compare.paths(out, rel);
                        
                        build.close();
                        
                        done();
                    });
                });

                // Run first bundle, start watching
                bundle(build, function() {
                    compare.paths(out, rel);
                    
                    // Trigger a rebuild
                    fs.utimesSync("./test/specimens/watchify-relative.css", new Date(), new Date());
                });
            });
        });
    });
});
