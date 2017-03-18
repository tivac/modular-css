"use strict";

var path   = require("path"),

    postcss = require("postcss"),
    
    plugin  = require("../plugins/externals.js"),
    resolve = require("../lib/resolve.js").resolve,
    
    processor = postcss([ plugin ]);

describe("/plugins", function() {
    describe("/externals.js", function() {
        var start = path.resolve("./packages/core/test/specimens/start.css"),
            local = path.resolve("./packages/core/test/specimens/local.css");

        // Helper to create environment where other files are already processed
        function process(css) {
            return processor.process(css, {
                resolve,

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
            expect(
                () => process(`:external(red from "./local.css) {}`).css
            )
            .toThrow(/: Unclosed string/);
            
            expect(
                () => process(`:external(blue from) {} `).css
            )
            .toThrowErrorMatchingSnapshot();
        });

        it("should fail if there's no file reference", function() {
            expect(
                () => process(`:external(booga) {}`).css
            )
            .toThrow(/externals must be from another file/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            expect(
                () => process(`:external(booga from "./no.css") {}`).css
            )
            .toThrow(/Unknown external source/);
        });

        it("should fail if a non-existant selector is referenced", function() {
            expect(
                () => process(`:external(booga from "./local.css") {}`).css
            )
            .toThrow(/Invalid external reference: booga/);
        });

        it("should support importing a selector from another file", function() {
            expect(
                process(`.a :external(fooga from "./local.css") {}`).css
            )
            .toMatchSnapshot();
        });
    });
});
