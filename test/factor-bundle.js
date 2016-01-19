"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    from       = require("from2-string"),
    mkdirp     = require("mkdirp"),
    factor     = require("factor-bundle"),
    
    plugin = require("../src/browserify"),
    
    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare-files");

describe("modular-css", function() {
    describe("factor-bundle", function() {
        after(function(done) {
            require("rimraf")("./test/output/factor-bundle", done);
        });
        
        it("should be supported", function(done) {
            var base  = "./test/specimens/factor-bundle/basic",
                build = browserify([
                    from("require('" + base + "/common.js'); require('./test/specimens/start.css');"),
                    from("require('" + base + "/common.js'); require('./test/specimens/local.css');")
                ]);
            
            mkdirp.sync("./test/output/factor-bundle/basic");
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/basic/basic.css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/basic/a.js",
                    "./test/output/factor-bundle/basic/b.js"
                ]
            });
            
            bundle(build, function(out) {
                fs.writeFileSync("./test/output/factor-bundle/basic/common.js", out);

                compare.results("/factor-bundle/basic/basic.css");
                compare.results("/factor-bundle/basic/_stream_0.css");
                
                done();
            });
        });
        
        it("should support files w/o commonalities", function(done) {
            var build = browserify([
                    from("require('./test/specimens/simple.css');"),
                    from("require('./test/specimens/blue.css');")
                ]);
            
            mkdirp.sync("./test/output/factor-bundle/nocommon");
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/nocommon/nocommon.css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/nocommon/a.js",
                    "./test/output/factor-bundle/nocommon/b.js"
                ]
            });
            
            bundle(build, function() {
                compare.results("/factor-bundle/nocommon/_stream_0.css");
                compare.results("/factor-bundle/nocommon/_stream_1.css");
                
                done();
            });
        });
        
        it("should properly handle files w/o dependencies", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/deps/a.js",
                    "./test/specimens/factor-bundle/deps/b.js"
                ]);
            
            mkdirp.sync("./test/output/factor-bundle/deps");
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/deps/deps.css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/deps/a.js",
                    "./test/output/factor-bundle/deps/b.js"
                ]
            });
            
            bundle(build, function() {
                compare.results("/factor-bundle/deps/deps.css");
                compare.results("/factor-bundle/deps/a.css");
                
                done();
            });
        });

        it("should support relative paths within factor-bundle files", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/relative/a.js",
                    "./test/specimens/factor-bundle/relative/b.js"
                ]);
            
            mkdirp.sync("./test/output/factor-bundle/relative");
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/relative/relative.css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/relative/a.js",
                    "./test/output/factor-bundle/relative/b.js"
                ]
            });
            
            bundle(build, function() {
                compare.results("/factor-bundle/relative/relative.css");
                compare.results("/factor-bundle/relative/a.css");
                compare.results("/factor-bundle/relative/b.css");
                
                done();
            });
        });

        it("should avoid outputting empty css files by default", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/noempty/a.js",
                    "./test/specimens/factor-bundle/noempty/b.js"
                ]);
            
            mkdirp.sync("./test/output/factor-bundle/noempty");
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/noempty/noempty.css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/noempty/a.js",
                    "./test/output/factor-bundle/noempty/b.js"
                ]
            });
            
            bundle(build, function() {
                assert.throws(function() {
                    fs.statSync("./test/output/factor-bundle/noempty/b.css");
                });
                
                compare.results("/factor-bundle/noempty/noempty.css");
                compare.results("/factor-bundle/noempty/a.css");
                
                done();
            });
        });

        it("should output empty css files when asked", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/empty/a.js",
                    "./test/specimens/factor-bundle/empty/b.js"
                ]);
            
            mkdirp.sync("./test/output/factor-bundle/empty");
            
            build.plugin(plugin, {
                css   : "./test/output/factor-bundle/empty/empty.css",
                empty : true
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/empty/a.js",
                    "./test/output/factor-bundle/empty/b.js"
                ]
            });
            
            bundle(build, function() {
                compare.results("/factor-bundle/empty/empty.css");
                compare.results("/factor-bundle/empty/a.css");
                compare.results("/factor-bundle/empty/b.css");
                
                done();
            });
        });
    });
});
