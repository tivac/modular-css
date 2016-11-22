"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("postcss"),
    
    plugin = require("../src/plugins/externals.js"),
    
    processor = postcss([ plugin ]);

describe("/plugins", function() {
    describe("/externals.js", function() {
        var start = path.resolve("./test/specimens/start.css"),
            local = path.resolve("./test/specimens/local.css");

        // Helper to create environment where other files are already processed
        function process(css) {
            return processor.process(css, {
                from  : start,
                files : {
                    // Composition source
                    [start] : {},

                    // Composition target
                    [local] : {
                        exports : {
                            fooga : [ "a", "b" ]
                        }
                    }
                }
            });
        }
        
        it("should fail to parse invalid declarations", function() {
            assert.throws(
                () => process(`:external(red from "./local.css) {}`).css,
                /: Unclosed string/
            );
            
            assert.throws(
                () => process(`:external(blue from) {} `).css,
                /SyntaxError: Expected source/
            );
        });

        it("should fail if there's no file reference", function() {
            assert.throws(
                () => process(`:external(booga) {}`).css,
                /externals must be from another file/
            );
        });

        it("should fail if importing from a file that doesn't exist", function() {
            assert.throws(
                () => process(`:external(booga from "./no.css") {}`).css,
                /Unknown external source/
            );
        });

        it("should fail if a non-existant selector is referenced", function() {
            assert.throws(
                () => process(`:external(booga from "./local.css") {}`).css,
                /Invalid external reference: booga/
            );
        });

        it("should support importing a selector from another file", function() {
            assert.equal(
                process(`.a :external(fooga from "./local.css") {}`).css,
                ".a .a.b {}"
            );
        });
    });
});
