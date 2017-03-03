"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    browserify = require("browserify"),
    from       = require("from2-string"),
    
    Processor = require("modular-css-core"),
    compare   = require("test-utils/compare.js"),
    
    plugin  = require("../browserify.js"),
    bundle  = require("./lib/bundle.js");

describe.skip("/issues", function() {
    // These tests can't be run until I can get onto a POSIX system and submit a symlink (ugh)
    describe.skip("/105", function() {
        it("should be able to compose using a symlink", function() {
            var processor = new Processor();
            
            return processor.file("./packages/browserify/test/specimens/issues/105/1.css").then(
                function(result) {
                    var one = result.files[path.resolve("./packages/browserify/test/specimens/issues/105/1.css")];
                    
                    assert.deepEqual(one.compositions, {
                        wooga : [
                            "mc42c563eb_fooga",
                            "mc89b4df98_wooga"
                        ]
                    });
                    
                    assert.deepEqual(result.exports, {
                        wooga : "mc42c563eb_fooga mc89b4df98_wooga"
                    });
                }
            );
        });
        
        it("should be able to reference symlinked files when running through browserify", function(done) {
            var build = browserify({
                    entries : from("require('./packages/browserify/test/specimens/issues/105/symlink.css');")
                });
            
            build.plugin(plugin, {
                css : "./packages/browserify/test/output/issues/105.css"
            });
            
            bundle(build, function() {
                compare.results("issues/105.css");
                
                done();
            });
        });
    });
});
