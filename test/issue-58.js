"use strict";

var assert = require("assert"),
    
    from       = require("from2-string"),
    shell      = require("shelljs"),
    browserify = require("browserify"),
    watchify   = require("watchify"),
    
    plugin = require("../src/browserify"),
    
    bundle  = require("./lib/bundle"),
    compare = require("./lib/compare-files");

describe("modular-css", function() {
    describe("issue 58", function() {
        after(function(done) {
            require("rimraf")("./test/output/issues", done);
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
                    assert(out.indexOf(JSON.stringify({
                        issue1 : "mc8fe42003_other1 mc0c6149b1_issue1",
                        issue2 : "mc8fe42003_other1 mc0c6149b1_issue1 mc8fe42003_other2 mc8fe42003_other3 mc0c6149b1_issue2"
                    }, null, 4)) > -1);
                    
                    compare.results("issues/58.css");
                    
                    build.close();
                    
                    done();
                });
            });

            bundle(build, function(out) {
                assert(out.indexOf(JSON.stringify({
                    issue1 : "mc8fe42003_other1 mc0c6149b1_issue1",
                    issue2 : "mc8fe42003_other1 mc0c6149b1_issue1 mc8fe42003_other3 mc0c6149b1_issue2"
                }, null, 4)) > -1);
                
                shell.cp("-f",
                    "./test/specimens/issues/58/2.css",
                    "./test/specimens/issues/58/other.css"
                );
            });
        });
    });
});
