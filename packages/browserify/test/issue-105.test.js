"use strict";

const browserify = require("browserify");
const from       = require("from2-string");
const Processor = require("@modular-css/processor");
const read = require("@modular-css/test-utils/read.js")(__dirname);
const bundle = require("./lib/bundle.js");
const plugin = require("../browserify.js");

describe("/browserify.js", () => {
    describe("/issues", () => {
        describe("/105", () => {
            // These tests can't be run until I can get onto a POSIX system and submit a symlink (ugh)
            
            // This test in particular is probably very broken now
            it.skip("should be able to compose using a symlink", () => {
                const processor = new Processor();
                
                return processor.file("./packages/browserify/test/specimens/issues/105/1.css")
                    .then((result) => expect(result).toMatchSnapshot());
            });
            
            it.skip("should be able to reference symlinked files when running through browserify", () => {
                const build = browserify({
                        entries : from("require('./packages/browserify/test/specimens/issues/105/symlink.css');"),
                    });
                
                build.plugin(plugin, {
                    css : "./packages/browserify/test/output/issues/105.css",
                });
                
                return bundle(build)
                    .then(() => {
                        expect(read("./issues/105.css")).toMatchSnapshot();
                    });
            });
        });
    });
});
