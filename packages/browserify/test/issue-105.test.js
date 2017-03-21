"use strict";

var browserify = require("browserify"),
    from       = require("from2-string"),
    
    Processor = require("modular-css-core"),
    
    read = require("test-utils/read.js")(__dirname),

    bundle = require("./lib/bundle.js"),
    plugin = require("../browserify.js");

describe("/browserify.js", function() {
    describe("/issues", function() {
        describe("/105", function() {
            // These tests can't be run until I can get onto a POSIX system and submit a symlink (ugh)
            
            // This test in particular is probably very broken now
            it.skip("should be able to compose using a symlink", function() {
                var processor = new Processor();
                
                return processor.file("./packages/browserify/test/specimens/issues/105/1.css")
                    .then((result) => expect(result).toMatchSnapshot());
            });
            
            it.skip("should be able to reference symlinked files when running through browserify", function() {
                var build = browserify({
                        entries : from("require('./packages/browserify/test/specimens/issues/105/symlink.css');")
                    });
                
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/issues/105.css"
                });
                
                return bundle(build)
                    .then(() => {
                        expect(read("./issues/105.css")).toMatchSnapshot();
                    });
            });
        });
    });
});
