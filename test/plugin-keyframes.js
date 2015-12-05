"use strict";

var assert = require("assert"),

    postcss = require("postcss"),
    
    scoping   = require("../src/plugins/scoping"),
    keyframes = require("../src/plugins/keyframes");

describe("postcss-modular-css", function() {
    describe("plugin-keyframes", function() {
        it("should update scoped animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga { } .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css" }
                );
            
            assert.equal(
                out.css,
                "@keyframes 08e91a5b_kooga { } " +
                ".08e91a5b_wooga { animation: 08e91a5b_kooga; }"
            );
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@-webkit-keyframes kooga { } .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css" }
                );
            
            assert.equal(
                out.css,
                "@-webkit-keyframes 08e91a5b_kooga { } " +
                ".08e91a5b_wooga { animation: 08e91a5b_kooga; }"
            );
        });
    });
});
