"use strict";

var path   = require("path"),
    assert = require("assert"),

    imports = require("../imports");

describe("postcss-css-modules", function() {
    describe("imports", function() {
        var start = imports.process("./test/specimens/imports/start.css");

        it("should walk dependencies", function() {
            assert("files" in start);
            
            assert(path.join(__dirname, "./specimens/imports/start.css") in start.files);
            assert(path.join(__dirname, "./specimens/imports/local.css") in start.files);
            assert(path.join(__dirname, "./specimens/imports/folder/folder.css") in start.files);
        });
        
        it("should walk dependencies into node_modules", function() {
            var result = imports.process("./test/specimens/imports/node_modules.css");
            
            assert(path.join(__dirname, "./specimens/imports/node_modules.css") in result.files);
            assert(path.join(__dirname, "./specimens/imports/node_modules/test-styles/styles.css") in result.files);
        });

        it("should export identifiers and their classes", function() {
            assert.deepEqual(start.exports, {
                wooga : [ "e90a9ca9bb862787d5423d08ffa8a320_booga" ],
                booga : [ "624cf273647af7597f5866483cde95d0_booga" ],
                tooga : [ "624cf273647af7597f5866483cde95d0_tooga" ]
            });
        });

        it("should generate correct css", function() {
            // normalize newlines
            var css = start.css.replace(/\r\n/g, "\n");

            assert.equal(css.indexOf(".b5600c78a155fc10eeddec15127659a8_folder {\n    margin: 2px;\n}"), 0);
            assert.equal(css.indexOf(".e90a9ca9bb862787d5423d08ffa8a320_booga {\n    background: green;\n}"), 63);
            assert.equal(css.indexOf(".624cf273647af7597f5866483cde95d0_booga {\n    color: red;\n    background: blue;\n}"), 131);
            assert.equal(css.indexOf(".624cf273647af7597f5866483cde95d0_tooga {\n    border: 1px solid white;\n}"), 218);
        });

        describe("values", function() {
            it("should fail if a non-existant import is referenced", function() {
                assert.throws(function() {
                    imports.process("./test/specimens/imports/invalid-value.css");
                });
            });
        });

        describe("composition", function() {
            it("should fail if a non-existant import is referenced", function() {
                assert.throws(function() {
                    imports.process("./test/specimens/imports/invalid-composition.css");
                });
            });
        });
    });
});
