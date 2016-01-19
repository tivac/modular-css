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
        before(function() {
            mkdirp.sync("./test/output/factor-bundle/basic");
            mkdirp.sync("./test/output/factor-bundle/nocommon");
            mkdirp.sync("./test/output/factor-bundle/deps");
            mkdirp.sync("./test/output/factor/bundle/relative");
            mkdirp.sync("./test/output/factor/bundle/noempty");
            mkdirp.sync("./test/output/factor/bundle/empty");
        });
        
        it.only("should be supported", function(done) {
            this.timeout(0);
            
            var build = browserify({
                    basedir : "./test/specimens",
                    entries : [
                        from("require('./factor-bundle/basic/common.js'); require('./start.css');"),
                        from("require('./factor-bundle/basic/common.js'); require('./local.css');")
                    ]
                });
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/basic/css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/basic/a.js",
                    "./test/output/factor-bundle/basic/b.js"
                ]
            });
            
            bundle(build, function(out) {
                fs.writeFileSync("./test/output/factor-bundle/basic/common.js", out);

                compare("factor-bundle/basic/css");
                compare("factor-bundle/basic/a.css");
                
                done();
            });
        });
        
        it("should support files w/o commonalities", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/nocommon/a.js",
                    "./test/specimens/factor-bundle/nocommon/b.js"
                ]);
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/nocommon/css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/nocommon/a.js",
                    "./test/output/factor-bundle/nocommon/b.js"
                ]
            });
            
            bundle(build, function() {
                compare("factor-bundle/nocommon/a.css");
                compare("factor-bundle/nocommon/b.css");
                
                done();
            });
        });
        
        it("should properly handle files w/o dependencies", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/deps/a.js",
                    "./test/specimens/factor-bundle/deps/b.js"
                ]);
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/deps/css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/deps/a.js",
                    "./test/output/factor-bundle/deps/b.js"
                ]
            });
            
            bundle(build, function() {
                compare("factor-bundle/deps/css");
                compare("factor-bundle/deps/a.css");
                
                done();
            });
        });

        it("should support relative paths within factor-bundle files", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/relative/a.js",
                    "./test/specimens/factor-bundle/relative/b.js"
                ]);
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/relative/css"
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/relative/a.js",
                    "./test/output/factor-bundle/relative/b.js"
                ]
            });
            
            bundle(build, function() {
                compare("factor-bundle/relative/css");
                compare("factor-bundle/relative/a.css");
                compare("factor-bundle/relative/b.css");
                
                done();
            });
        });

        it("should avoid outputting empty css files by default", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/noempty/a.js",
                    "./test/specimens/factor-bundle/noempty/b.js"
                ]);
            
            build.plugin(plugin, {
                css : "./test/output/factor-bundle/noempty/css"
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
                
                compare("factor-bundle/noempty/css");
                compare("factor-bundle/noempty/a.css");
                
                done();
            });
        });

        it("should output empty css files when asked", function(done) {
            var build = browserify([
                    "./test/specimens/factor-bundle/empty/a.js",
                    "./test/specimens/factor-bundle/empty/b.js"
                ]);
            
            build.plugin(plugin, {
                css   : "./test/output/factor-bundle/empty/css",
                empty : true
            });

            build.plugin(factor, {
                outputs : [
                    "./test/output/factor-bundle/empty/a.js",
                    "./test/output/factor-bundle/empty/b.js"
                ]
            });
            
            bundle(build, function() {
                compare("factor-bundle/empty/css");
                compare("factor-bundle/empty/a.css");
                compare("factor-bundle/empty/b.css");
                
                done();
            });
        });
    });
});
