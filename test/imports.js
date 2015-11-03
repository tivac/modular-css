"use strict";

var assert = require("assert"),

    imports = require("../src/imports");

describe("postcss-css-modules", function() {
    describe("imports", function() {
        it("should check strings for format correctness", function() {
            assert(imports.match("fooga from \"/booga.css\""));
            assert(imports.match("fooga from '/booga.css'"));
            assert(imports.match("fooga, booga from '/booga.css'"));
        });
        
        it("should parse strings into their pieces", function() {
            assert.deepEqual(
                imports.parse("fooga from \"/booga.css\""),
                {
                    keys   : [ "fooga" ],
                    source : "/booga.css"
                }
            );
            
            assert.deepEqual(
                imports.parse("fooga from '/booga.css'"),
                {
                    keys   : [ "fooga" ],
                    source : "/booga.css"
                }
            );
            
            assert.deepEqual(
                imports.parse("fooga, booga from '/booga.css'"),
                {
                    keys   : [ "fooga", "booga" ],
                    source : "/booga.css"
                }
            );
        });
    });
});
