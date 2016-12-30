"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("./lib/postcss.js"),
    
    scoping   = require("../src/plugins/scoping"),
    keyframes = require("../src/plugins/keyframes");

function namer(file, selector) {
    return path.basename(file, path.extname(file)) + "_" + selector;
}

describe("/plugins", function() {
    describe("/keyframes.js", function() {
        it("should update scoped animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga {} .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css", namer : namer }
                );
            
            assert.equal(
                out.css,
                "@keyframes simple_kooga {} .simple_wooga { animation: simple_kooga; }"
            );
        });

        it("should update the animation-name property", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga {} .wooga { animation-name: kooga; }",
                    { from : "test/specimens/simple.css", namer : namer }
                );
            
            assert.equal(
                out.css,
                "@keyframes simple_kooga {} .simple_wooga { animation-name: simple_kooga; }"
            );
        });

        // Issue 208
        it("should update multiple animations properly", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga {} @keyframes tooga {} .wooga { animation: kooga 10s linear, tooga 0.2s infinite; }",
                    { from : "test/specimens/simple.css", namer : namer }
                );
            
            assert.equal(
                out.css,
                "@keyframes simple_kooga {} @keyframes simple_tooga {} .simple_wooga { animation: simple_kooga 10s linear, simple_tooga 0.2s infinite; }"
            );
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@-webkit-keyframes kooga {} .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css", namer : namer }
                );
            
            assert.equal(
                out.css,
                "@-webkit-keyframes simple_kooga {} .simple_wooga { animation: simple_kooga; }"
            );
        });
    });
});
