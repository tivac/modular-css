"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    mock = require("mock-fs"),
    
    processor = require("../src/processor"),
    
    cwd = process.cwd();

describe("postcss-css-modules", function() {
    describe("processor", function() {
        before(function() {
            mock(require("./_file-system"));
        });
        
        after(mock.restore);

        it("should walk dependencies", function() {
            var result = processor.file("./start.css");
            
            assert("files" in result);
            
            assert(path.join(cwd, "./start.css") in result.files);
            assert(path.join(cwd, "./local.css") in result.files);
            assert(path.join(cwd, "./folder/folder.css") in result.files);
        });
        
        it("should walk dependencies into node_modules", function() {
            var result = processor.file("./node_modules.css");
            
            assert(path.join(cwd, "./node_modules.css") in result.files);
            assert(path.join(cwd, "./node_modules/test-styles/styles.css") in result.files);
        });

        it("should export identifiers and their classes", function() {
            var result = processor.file("./start.css");
            
            assert.deepEqual(result.exports, {
                wooga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                booga : [ "2ba8076ec1145293c7e3600dbc63b306_booga" ],
                tooga : [ "2ba8076ec1145293c7e3600dbc63b306_tooga" ]
            });
        });

        it("should generate correct css", function() {
            var css = processor.file("./start.css").css;
            
            assert.equal(css.indexOf(".dafdfcc7dc876084d352519086f9e6e9_folder { margin: 2px; }"), 0);
            assert.equal(css.indexOf(".f5507abd3eea0987714c5d92c3230347_booga { background: green; }"), 59);
            assert.equal(css.indexOf(".2ba8076ec1145293c7e3600dbc63b306_booga { color: red; background: blue; }"), 123);
            assert.equal(css.indexOf(".2ba8076ec1145293c7e3600dbc63b306_tooga { border: 1px solid white; }"), 197);
        });
        
        it("should support being passed a string", function() {
            var result = processor.string(
                    path.join(cwd, "./start.css"),
                    ".wooga { composes: booga from \"./local.css\"; }"
                ),
                css = result.css;
            
            assert(path.join(cwd, "./start.css") in result.files);
            assert(path.join(cwd, "./local.css") in result.files);
            assert(path.join(cwd, "./folder/folder.css") in result.files);
            
            assert.equal(css.indexOf(".dafdfcc7dc876084d352519086f9e6e9_folder { margin: 2px; }"), 0);
            assert.equal(css.indexOf(".f5507abd3eea0987714c5d92c3230347_booga { background: green; }"), 59);
        });

        describe("values", function() {
            it("should fail if a non-existant import is referenced", function() {
                assert.throws(function() {
                    processor.file("./invalid/value.css");
                });
            });
        });

        describe("composition", function() {
            it("should fail if a non-existant import is referenced", function() {
                assert.throws(function() {
                    processor.file("./invalid/composition.css");
                });
            });
        });
    });
});
