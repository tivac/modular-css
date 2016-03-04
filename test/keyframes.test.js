"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("postcss"),
    
    scoping   = require("../src/plugins/scoping"),
    keyframes = require("../src/plugins/keyframes");

function namer(file, selector) {
    return path.basename(file, path.extname(file)) + "_" + selector;
}

describe("/plugins", function() {
    describe("/keyframes.js", function() {
        it("should update scoped animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga { } .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css", namer : namer }
                );
            
            assert.equal(
                out.css,
                "@keyframes simple_kooga { } " +
                ".simple_wooga { animation: simple_kooga; }"
            );
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@-webkit-keyframes kooga { } .wooga { animation: kooga; }",
                    { from : "test/specimens/simple.css", namer : namer }
                );
            
            assert.equal(
                out.css,
                "@-webkit-keyframes simple_kooga { } " +
                ".simple_wooga { animation: simple_kooga; }"
            );
        });
    });
});
