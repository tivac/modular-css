"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    watchify   = require("watchify"),
    shell      = require("shelljs"),
    from       = require("from2-string"),
    
    plugin = require("../src/browserify"),
    
    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare-files");

describe("modular-css", function() {
    describe("watchify", function() {
        after(function(done) {
            require("rimraf")("./test/output/watchify", done);
        });
        
        describe("caching", function() {
            after(function() {
                shell.rm("./test/specimens/watchify/caching.css");
            });

            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify();
                
                shell.cp("-f",
                    "./test/specimens/simple.css",
                    "./test/specimens/watchify/caching.css"
                );
                
                build.add(from("require('./test/specimens/watchify/caching.css');"));

                build.plugin(watchify);
                build.plugin(plugin, {
                    css : "./test/output/watchify/caching.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build, function() {
                        compare.results("/watchify/caching.css", "/watchify/caching-2.css");
                        
                        build.close();
                        
                        done();
                    });
                });

                // Run first bundle, start watching
                bundle(build, function() {
                    compare.results("/watchify/caching.css", "/watchify/caching-1.css");

                    shell.cp("-f",
                        "./test/specimens/blue.css",
                        "./test/specimens/watchify/caching.css"
                    );
                });
            });
        });
        
        describe("error handling", function() {
            after(function() {
                shell.rm("./test/specimens/watchify/errors.css");
            });
        
            it("shouldn't explode on invalid CSS", function(done) {
                var build = browserify(),
                    wait;
                
                shell.cp("-f",
                    "./test/specimens/invalid.css",
                    "./test/specimens/watchify/errors.css"
                );
                
                build.add(from("require('./test/specimens/watchify/errors.css');"));

                build.plugin(watchify);
                build.plugin(plugin, {
                    css : "./test/output/watchify/errors.css"
                });

                // File changed
                build.on("update", function() {
                    // Attempt to bundle again
                    bundle(build, function() {
                        compare.results("/watchify/errors.css", "/watchify/errors.css");
                        
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
                        shell.cp("-f",
                            "./test/specimens/blue.css",
                            "./test/specimens/watchify/errors.css"
                        );
                    });
                });
            });
        });
        
        describe("caching", function() {
            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify(from("require('./test/specimens/watchify/relative.css');"));

                build.plugin(watchify);
                build.plugin(plugin, {
                    css : "./test/output/watchify/relative.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build, function() {
                        compare.results("/watchify/relative.css");
                        
                        build.close();
                        
                        done();
                    });
                });

                // Run first bundle, start watching
                bundle(build, function() {
                    compare.results("/watchify/relative.css");
                    
                    // Trigger a rebuild
                    fs.utimesSync("./test/specimens/watchify/relative.css", new Date(), new Date());
                });
            });
        });
    });
});
