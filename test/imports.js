"use strict";

var path   = require("path"),
    assert = require("assert"),

    imports = require("../imports");

describe("postcss-css-modules", function() {
    describe("imports", function() {
        it("should walk dependencies", function() {
            var result = imports.process("./test/specimens/imports/start.css");
            
            assert("files" in result);
            
            assert(path.join(__dirname, "./specimens/imports/start.css") in result.files);
            assert(path.join(__dirname, "./specimens/imports/local.css") in result.files);
            assert(path.join(__dirname, "./specimens/imports/folder/folder.css") in result.files);
        });
        
        it("should walk dependencies into node_modules", function() {
            var result = imports.process("./test/specimens/imports/node_modules.css");
            
            assert(path.join(__dirname, "./specimens/imports/node_modules.css") in result.files);
            assert(path.join(__dirname, "./specimens/imports/node_modules/test-styles/styles.css") in result.files);
        });

        it("should export identifiers and their classes", function() {
            var result  = imports.process("./test/specimens/imports/start.css"),
                exports = result.exports;

            assert.deepEqual(exports, {
                wooga : [ "771db310e8d1c8c48a9d4d3e5c0af682_booga" ],
                booga : [ "82a0a82265094a412fd49bf12216eac5_booga" ]
            });
        });
    });
});
