"use strict";

var assert = require("assert"),

    postcss = require("postcss"),
    
    scoping   = require("../src/plugins/scoping"),
    keyframes = require("../src/plugins/keyframes");

describe("modular-css", function() {
    describe("plugin-keyframes", function() {
        it("should update scoped animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga { } .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css" }
                );
            
            assert.equal(
                out.css,
                "@keyframes mc08e91a5b_kooga { } " +
                ".mc08e91a5b_wooga { animation: mc08e91a5b_kooga; }"
            );
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@-webkit-keyframes kooga { } .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css" }
                );
            
            assert.equal(
                out.css,
                "@-webkit-keyframes mc08e91a5b_kooga { } " +
                ".mc08e91a5b_wooga { animation: mc08e91a5b_kooga; }"
            );
        });
    });
});
