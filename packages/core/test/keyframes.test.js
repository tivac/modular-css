"use strict";

var postcss = require("postcss"),
    
    scoping   = require("../plugins/scoping.js"),
    keyframes = require("../plugins/keyframes.js");

function namer(file, selector) {
    return selector;
}

describe("/plugins", function() {
    describe("/keyframes.js", function() {
        it("should leave unknown animation names alone", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    ".a { animation: a; } .b { animation-name: b; }",
                    { from : "packages/core/test/specimens/simple.css", namer : namer }
                );
            
            expect(out.css).toMatchSnapshot();
        });
        
        it("should update scoped animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga {} .wooga { animation: kooga; }",
                    { from : "packages/core/test/specimens/simple.css", namer : namer }
                );
            
            expect(out.css).toMatchSnapshot();
        });

        it("should update the animation-name property", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga {} .wooga { animation-name: kooga; }",
                    { from : "packages/core/test/specimens/simple.css", namer : namer }
                );
            
            expect(out.css).toMatchSnapshot();
        });

        // Issue 208
        it("should update multiple animations properly", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@keyframes kooga {} @keyframes tooga {} .wooga { animation: kooga 10s linear, tooga 0.2s infinite; }",
                    { from : "packages/core/test/specimens/simple.css", namer : namer }
                );
            
            expect(out.css).toMatchSnapshot();
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            var out = postcss([ scoping, keyframes ]).process(
                    "@-webkit-keyframes kooga {} .wooga { animation: kooga; }",
                    { from : "packages/core/test/specimens/simple.css", namer : namer }
                );
            
            expect(out.css).toMatchSnapshot();
        });
    });
});
