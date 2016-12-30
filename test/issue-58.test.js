"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    from       = require("from2-string"),
    shell      = require("shelljs"),
    browserify = require("browserify"),
    watchify   = require("watchify"),
    rimraf     = require("rimraf"),
    
    plugin = require("../src/browserify"),
    
    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare.js");

describe("/issues", function() {
    describe.skip("/58", function() {
        after(function() {
            rimraf.sync("./test/output/issues");
            rimraf.sync("./test/specimens/issues/58/other.css");
        });
        
        it("should update when CSS dependencies change", function(done) {
            var build = browserify();
            
            shell.cp("-f",
                "./test/specimens/issues/58/1.css",
                "./test/specimens/issues/58/other.css"
            );
            
            build.add(from("require('./test/specimens/issues/58/issue.css');"));

            build.plugin(watchify);
            build.plugin(plugin, {
                css : "./test/output/issues/58.css"
            });

            build.on("update", function() {
                bundle(build, function(out) {
                    assert.equal(out, fs.readFileSync("./test/results/issues/58-2.js", "utf8"));
                    
                    compare.results("issues/58.css");
                    
                    build.close();
                    
                    done();
                });
            });

            bundle(build, function(out) {
                assert.equal(out, fs.readFileSync("./test/results/issues/58-1.js", "utf8"));
                
                shell.cp("-f",
                    "./test/specimens/issues/58/2.css",
                    "./test/specimens/issues/58/other.css"
                );
            });
        });
    });
});
