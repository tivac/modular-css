"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    shell  = require("shelljs"),
    
    browserify = require("browserify"),
    watchify   = require("watchify"),
    
    plugin  = require("../src/browserify");

function equal(path1, path2) {
    assert.equal(
        fs.readFileSync(path1, "utf8") + "\n",
        fs.readFileSync(path2, "utf8"),
        "Expected " + path1 + " to be the same as " + path2
    );
}

function compare(name1, name2) {
    var path1 = path.join("./test/output", name1),
        path2 = path.join("./test/results", name2 || name1);

    return equal(path1, path2);
}

function bundle(build, done) {
    build.bundle(function(err, out) {
        assert.ifError(err);

        // Wrapped because browserify event lifecycle is... odd
        setImmediate(function() {
            done(out.toString());
        });
    });
}

describe("postcss-modular-css", function() {
    describe("browserify plugin", function() {
        before(function() {
            require("shelljs").rm("-rf", "./test/output/*.*");
        });
        
        it("should error if an invalid extension is applied", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.on("error", function(err) {
                assert.equal(err, "Missing or invalid \"ext\" option: false");

                done();
            });

            build.plugin(plugin, { ext : false });
        });

        it("should error on invalid CSS", function(done) {
            var build  = browserify("./test/specimens/invalid.js"),
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
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin);
            
            bundle(build, function(out) {
                assert(out.indexOf(fs.readFileSync("./test/results/browserify-export-identifiers.js", "utf8")) > -1);

                done();
            });
        });

        it("should correctly rewrite urls based on the destination file", function(done) {
            var build = browserify("./test/specimens/relative.js");
            
            build.plugin(plugin, {
                css : "./test/output/browserify-relative.css"
            });
            
            bundle(build, function() {
                compare("browserify-relative.css");
                
                done();
            });
        });

        it("should use the specified prefix", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin, {
                css    : "./test/output/browserify-prefix.css",
                prefix : "prefix"
            });
            
            bundle(build, function() {
                compare("browserify-prefix.css");
                
                done();
            });
        });

        it("should use the specified namer function", function(done) {
            var build = browserify("./test/specimens/keyframes.js");
            
            build.plugin(plugin, {
                css   : "./test/output/browserify-namer-fn.css",
                namer : function(file, selector) {
                    return path.basename(file, path.extname(file)) + "-" + selector;
                }
            });
            
            bundle(build, function() {
                compare("browserify-namer-fn.css");
                
                done();
            });
        });

        it("should include all CSS dependencies in output css", function(done) {
            var build = browserify("./test/specimens/start.js");
            
            build.plugin(plugin, { css : "./test/output/browserify-include-css-deps.css" });
            
            bundle(build, function(out) {
                assert(out.indexOf(fs.readFileSync("./test/results/browserify-include-css-deps.js", "utf8")) > -1);

                compare("browserify-include-css-deps.css");
                
                done();
            });
        });

        it("should write out the complete exported identifiers when `json` is specified", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin, { json : "./test/output/browserify-export-all-identifiers.json" });
            
            bundle(build, function() {
                compare("browserify-export-all-identifiers.json");

                done();
            });
        });

        it("should not include duplicate files in the output multiple times", function(done) {
            var build = browserify("./test/specimens/duplication.js");
            
            build.plugin(plugin, { css : "./test/output/browserify-avoid-duplicates.css" });
            
            bundle(build, function(out) {
                assert(out.indexOf(fs.readFileSync("./test/results/browserify-avoid-duplicates-local.js", "utf8")) > -1);
                assert(out.indexOf(fs.readFileSync("./test/results/browserify-avoid-duplicates-start.js", "utf8")) > -1);

                compare("browserify-avoid-duplicates.css");
                
                done();
            });
        });
        
        describe("factor-bundle", function() {
            it("should be supported", function(done) {
                var build = browserify([
                        "./test/specimens/browserify-fb-basic-a.js",
                        "./test/specimens/browserify-fb-basic-b.js"
                    ]);
                
                build.plugin(plugin, {
                    css : "./test/output/browserify-fb-basic.css"
                });

                build.plugin("factor-bundle", {
                    outputs : [
                        "./test/output/browserify-fb-basic-a.js",
                        "./test/output/browserify-fb-basic-b.js"
                    ]
                });
                
                bundle(build, function(out) {
                    fs.writeFileSync("./test/output/browserify-fb-basic-common.js", out);

                    compare("browserify-fb-basic.css");
                    compare("browserify-fb-basic-a.css");
                    
                    done();
                });
            });
            
            it("should support files w/o commonalities", function(done) {
                var build = browserify([
                        "./test/specimens/browserify-fb-nocommon-a.js",
                        "./test/specimens/browserify-fb-nocommon-b.js"
                    ]);
                
                build.plugin(plugin, {
                    css : "./test/output/browserify-fb-nocommon.css"
                });

                build.plugin("factor-bundle", {
                    outputs : [
                        "./test/output/browserify-fb-nocommon-a.js",
                        "./test/output/browserify-fb-nocommon-b.js"
                    ]
                });
                
                bundle(build, function() {
                    compare("browserify-fb-nocommon-a.css");
                    compare("browserify-fb-nocommon-b.css");
                    
                    done();
                });
            });
            
            it("should properly handle files w/o dependencies", function(done) {
                var build = browserify([
                        "./test/specimens/browserify-fb-deps-a.js",
                        "./test/specimens/browserify-fb-deps-b.js"
                    ]);
                
                build.plugin(plugin, {
                    css : "./test/output/browserify-fb-deps.css"
                });

                build.plugin("factor-bundle", {
                    outputs : [
                        "./test/output/browserify-fb-deps-a.js",
                        "./test/output/browserify-fb-deps-b.js"
                    ]
                });
                
                bundle(build, function() {
                    compare("browserify-fb-deps.css");
                    compare("browserify-fb-deps-a.css");
                    
                    done();
                });
            });

            it("should support relative paths within factor-bundle files", function(done) {
                var build = browserify([
                        "./test/specimens/browserify-fb-relative-a.js",
                        "./test/specimens/browserify-fb-relative-b.js"
                    ]);
                
                build.plugin(plugin, {
                    css : "./test/output/browserify-fb-relative.css"
                });

                build.plugin("factor-bundle", {
                    outputs : [
                        "./test/output/browserify-fb-relative-a.js",
                        "./test/output/browserify-fb-relative-b.js"
                    ]
                });
                
                bundle(build, function() {
                    compare("browserify-fb-relative.css");
                    compare("browserify-fb-relative-a.css");
                    compare("browserify-fb-relative-b.css");
                    
                    done();
                });
            });

            it("should avoid outputting empty css files by default", function(done) {
                var build = browserify([
                        "./test/specimens/browserify-fb-noempty-a.js",
                        "./test/specimens/browserify-fb-noempty-b.js"
                    ]);
                
                build.plugin(plugin, {
                    css : "./test/output/browserify-fb-noempty.css"
                });

                build.plugin("factor-bundle", {
                    outputs : [
                        "./test/output/browserify-fb-noempty-a.js",
                        "./test/output/browserify-fb-noempty-b.js"
                    ]
                });
                
                bundle(build, function() {
                    assert.throws(function() {
                        fs.statSync("./test/output/browserify-fb-noempty-b.css");
                    });
                    
                    compare("browserify-fb-noempty.css");
                    compare("browserify-fb-noempty-a.css");
                    
                    done();
                });
            });

            it("should output empty css files when asked", function(done) {
                var build = browserify([
                        "./test/specimens/browserify-fb-empty-a.js",
                        "./test/specimens/browserify-fb-empty-b.js"
                    ]);
                
                build.plugin(plugin, {
                    css   : "./test/output/browserify-fb-empty.css",
                    empty : true
                });

                build.plugin("factor-bundle", {
                    outputs : [
                        "./test/output/browserify-fb-empty-a.js",
                        "./test/output/browserify-fb-empty-b.js"
                    ]
                });
                
                bundle(build, function() {
                    compare("browserify-fb-empty.css");
                    compare("browserify-fb-empty-a.css");
                    compare("browserify-fb-empty-b.css");
                    
                    done();
                });
            });
        });

        describe("watchify", function() {
            describe("caching", function() {
                beforeEach(function() {
                    shell.cp("-f", "./test/specimens/simple.css", "./test/specimens/watchify.css");
                });

                after(function() {
                    shell.rm("./test/specimens/watchify.css");
                });

                it("shouldn't cache file contents between watchify runs", function(done) {
                    var build = browserify("./test/specimens/watchify.js");

                    build.plugin(watchify);
                    build.plugin(plugin, {
                        css : "./test/output/watchify.css"
                    });

                    // File changed
                    build.on("update", function() {
                        bundle(build, function() {
                            compare("watchify.css", "watchify-2.css");
                            
                            build.close();
                            
                            done();
                        });
                    });

                    // Run first bundle, start watching
                    bundle(build, function() {
                        compare("watchify.css", "watchify-1.css");

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
                    var build = browserify("./test/specimens/watchify.js"),
                        wait;

                    build.plugin(watchify);
                    build.plugin(plugin, {
                        css : "./test/output/watchify.css"
                    });

                    // File changed
                    build.on("update", function() {
                        // Attempt to bundle again
                        bundle(build, function() {
                            compare("watchify.css", "watchify-2.css");
                            
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

            describe("postcss-urls", function() {
                var out = path.resolve("./test/__output.css"),
                    rel = path.resolve("./test/results/watchify-relative.css");
                
                after(function() {
                    shell.rm(out);
                });
                
                it("shouldn't cache file contents between watchify runs", function(done) {
                    var build = browserify("./test/specimens/watchify-relative.js");

                    build.plugin(watchify);
                    build.plugin(plugin, {
                        // Generating to a weird spot to get bug to repro
                        css : out
                    });

                    // File changed
                    build.on("update", function() {
                        bundle(build, function() {
                            equal(out, rel);
                            
                            build.close();
                            
                            done();
                        });
                    });

                    // Run first bundle, start watching
                    bundle(build, function() {
                        equal(out, rel);
                        
                        // Trigger a rebuild
                        fs.utimesSync("./test/specimens/watchify-relative.css", new Date(), new Date());
                    });
                });
            });
        });
    });
});
