"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    
    plugin  = require("../src/browserify");

function compare(name1, name2) {
    var path1 = path.join("./test/output", name1),
        path2 = path.join("./test/results", name2 || name1);

    assert.equal(
        fs.readFileSync(path1, "utf8") + "\n",
        fs.readFileSync(path2, "utf8"),
        "Expected " + path1 + " to be the same as " + path2
    );
}

function bundle(build, done) {
    build.bundle(function(err, out) {
        assert.ifError(err);

        // Wrapped because browserify event lifecycle is... odd
        setImmediate(function() {
            done(out);
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

        it("should replace require() calls with the exported identifiers", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin);
            
            build.bundle(function(err, out) {
                assert.ifError(err);
                assert(out.toString().indexOf(fs.readFileSync("./test/results/browserify-export-identifiers.js", "utf8")) > -1);

                done();
            });
        });

        it("should correctly rewrite urls based on the destination file", function(done) {
            var build = browserify("./test/specimens/relative.js");
            
            build.plugin(plugin, {
                css : "./test/output/browserify-relative.css"
            });
            
            build.bundle(function(err) {
                assert.ifError(err);
                
                // Wrapped because browserify event lifecycle is... odd
                setImmediate(function() {
                    compare("browserify-relative.css");
                    
                    done();
                });
            });
        });

        it("should use the specified prefix", function(done) {
            var build = browserify("./test/specimens/simple.js");
            
            build.plugin(plugin, {
                css    : "./test/output/browserify-prefix.css",
                prefix : "prefix"
            });
            
            build.bundle(function(err) {
                assert.ifError(err);
                
                // Wrapped because browserify event lifecycle is... odd
                setImmediate(function() {
                    compare("browserify-prefix.css");
                    
                    done();
                });
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
            
            build.bundle(function(err) {
                assert.ifError(err);
                
                // Wrapped because browserify event lifecycle is... odd
                setImmediate(function() {
                    compare("browserify-namer-fn.css");
                    
                    done();
                });
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
                    compare("browserify-include-css-deps.css");
                    
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
                    compare("browserify-avoid-duplicates.css");
                    
                    done();
                });
            });
        });
        
        describe("factor-bundle support", function() {
            it("should support factor-bundle", function(done) {
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
                
                bundle(build, function() {
                    compare("browserify-fb-basic.css");
                    compare("browserify-fb-basic-a.css");
                    
                    done();
                });
            });
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
                    compare("browserify-fb-relative-a.css");
                    
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
                    
                    assert.throws(function() {
                        fs.statSync("./test/output/browserify-fb-noempty-common.css");
                    });
                    
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
                    compare("browserify-fb-empty-b.css");
                    
                    done();
                });
            });
        });
    });
});
