"use strict";

var fs = require("fs"),
    
    browserify = require("browserify"),
    from       = require("from2-string"),
    shell      = require("shelljs"),
    
    bundle = require("./lib/bundle.js"),
    read   = require("./lib/read.js"),

    plugin = require("../browserify.js");

describe("/browserify.js", function() {
    describe("watchify", function() {
        afterAll(() => shell.rm("-rf", "./packages/browserify/test/output/watchify"));
        
        describe("caching", function() {
            afterAll(function() {
                shell.rm("./packages/browserify/test/specimens/watchify/caching.css");
            });

            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify();
                
                shell.cp("-f",
                    "./packages/browserify/test/specimens/simple.css",
                    "./packages/browserify/test/specimens/watchify/caching.css"
                );
                
                build.add(from("require('./packages/browserify/test/specimens/watchify/caching.css');"));

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/watchify/caching.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build)
                        .then(() => {
                            expect(read("./watchify/caching.css")).toMatchSnapshot();
                            
                            build.close();
                            
                            done();
                        });
                });

                // Run first bundle, start watching
                bundle(build)
                    .then(() => {
                        expect(read("./watchify/caching.css")).toMatchSnapshot();

                        shell.cp("-f",
                            "./packages/browserify/test/specimens/blue.css",
                            "./packages/browserify/test/specimens/watchify/caching.css"
                        );
                    });
            });
        });
        
        describe("error handling", function() {
            afterAll(function() {
                shell.rm("./packages/browserify/test/specimens/watchify/errors.css");
            });
        
            it("shouldn't explode on invalid CSS", function(done) {
                var build = browserify(),
                    wait;
                
                shell.cp("-f",
                    "./packages/browserify/test/specimens/invalid.css",
                    "./packages/browserify/test/specimens/watchify/errors.css"
                );
                
                build.add(from("require('./packages/browserify/test/specimens/watchify/errors.css');"));

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/watchify/errors.css"
                });

                // File changed
                build.on("update", function() {
                    // Attempt to bundle again
                    bundle(build)
                        .then(() => {
                            expect(read("./watchify/errors.css", "/watchify/errors.css")).toMatchSnapshot();
                            
                            build.close();
                            
                            done();
                        });
                });

                // Run first bundle to start watching
                build.bundle(function(err) {
                    // This one should fail, but not stop watchify from running
                    expect(err).toMatchSnapshot();
                    
                    if(wait) {
                        return;
                    }
                    
                    // Wrapped because browserify event lifecycle is... odd
                    wait = setImmediate(function() {
                        shell.cp("-f",
                            "./packages/browserify/test/specimens/blue.css",
                            "./packages/browserify/test/specimens/watchify/errors.css"
                        );
                    });
                });
            });
        });
        
        describe("caching", function() {
            it("shouldn't cache file contents between watchify runs", function(done) {
                var build = browserify(from("require('./packages/browserify/test/specimens/watchify/relative.css');"));

                build.plugin("watchify");
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/watchify/relative.css"
                });

                // File changed
                build.on("update", function() {
                    bundle(build)
                        .then(() => {
                            expect(read("./watchify/relative.css")).toMatchSnapshot();
                            
                            build.close();
                            
                            done();
                        });
                });

                // Run first bundle, start watching
                bundle(build)
                    .then(() => {
                        expect(read("./watchify/relative.css")).toMatchSnapshot();
                        
                        // Trigger a rebuild
                        fs.utimesSync("./packages/browserify/test/specimens/watchify/relative.css", new Date(), new Date());
                    });
            });
        });
    });
});
