"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    from       = require("from2-string"),
    shell      = require("shelljs"),
    browserify = require("browserify"),
    watchify   = require("watchify"),
    
    compare = require("test-utils/compare.js"),
    
    plugin = require("../browserify.js"),
    bundle  = require("./lib/bundle.js");

describe.skip("/issues", function() {
    describe("/58", function() {
        afterAll(() => {
            shell.rm("-rf", "./packages/browserify/test/output/issues")
            shell.rm("./packages/browserify/test/specimens/issues/58/other.css");
        });
        
        it("should update when CSS dependencies change", function(done) {
            var build = browserify();
            
            shell.cp("-f",
                "./packages/browserify/test/specimens/issues/58/1.css",
                "./packages/browserify/test/specimens/issues/58/other.css"
            );
            
            build.add(from("require('./packages/browserify/test/specimens/issues/58/issue.css');"));

            build.plugin(watchify);
            build.plugin(plugin, {
                css : "./packages/browserify/test/output/issues/58.css"
            });

            build.on("update", function() {
                bundle(build, function(out) {
                    assert.equal(out, fs.readFileSync("./packages/browserify/test/results/issues/58-2.js", "utf8"));
                    
                    compare.results("issues/58.css");
                    
                    build.close();
                    
                    done();
                });
            });

            bundle(build, function(out) {
                assert.equal(out, fs.readFileSync("./packages/browserify/test/results/issues/58-1.js", "utf8"));
                
                shell.cp("-f",
                    "./packages/browserify/test/specimens/issues/58/2.css",
                    "./packages/browserify/test/specimens/issues/58/other.css"
                );
            });
        });
    });
});
