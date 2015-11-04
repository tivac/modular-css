"use strict";

var assert = require("assert"),

    imports = require("../src/imports");

describe("postcss-modular-css", function() {
    describe("imports", function() {
        it("should check strings for format correctness", function() {
            assert(imports.match("fooga from \"/booga.css\""));
            assert(imports.match("fooga from '/booga.css'"));
            assert(imports.match("fooga, booga from '/booga.css'"));
        });
        
        it("should parse strings into their pieces", function() {
            assert.deepEqual(
                imports.parse("./test/specimens/simple.css", "fooga from \"./start.css\""),
                {
                    keys   : [ "fooga" ],
                    source : "test/specimens/start.css"
                }
            );
            
            assert.deepEqual(
                imports.parse("./test/specimens/simple.css", "fooga from './start.css'"),
                {
                    keys   : [ "fooga" ],
                    source : "test/specimens/start.css"
                }
            );
            
            assert.deepEqual(
                imports.parse("./test/specimens/simple.css", "fooga, booga from './start.css'"),
                {
                    keys   : [ "fooga", "booga" ],
                    source : "test/specimens/start.css"
                }
            );
        });
    });
});
