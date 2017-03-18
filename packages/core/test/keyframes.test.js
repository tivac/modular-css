"use strict";

var postcss = require("postcss"),
    
    scoping   = require("../plugins/scoping.js"),
    keyframes = require("../plugins/keyframes.js");

function namer(file, selector) {
    return selector;
}

describe("/plugins", function() {
    describe("/keyframes.js", function() {
        function process(css) {
            return postcss([
                scoping,
                keyframes
            ])
            .process(
                css,
                {
                    from : "packages/core/test/specimens/simple.css",
                    namer
                }
            );
        }

        it("should leave unknown animation names alone", function() {
            expect(
                process(
                    ".a { animation: a; } .b { animation-name: b; }"
                )
                .css
            )
            .toMatchSnapshot();
        });
        
        it("should update scoped animations from the scoping plugin's message", function() {
            expect(
                process(
                    "@keyframes kooga {} .wooga { animation: kooga; }"
                )
                .css
            )
            .toMatchSnapshot();
        });

        it("should update the animation-name property", function() {
            expect(
                process(
                    "@keyframes kooga {} .wooga { animation-name: kooga; }"
                )
                .css
            )
            .toMatchSnapshot();
        });

        // Issue 208
        it("should update multiple animations properly", function() {
            expect(
                process(
                    "@keyframes kooga {} @keyframes tooga {} .wooga { animation: kooga 10s linear, tooga 0.2s infinite; }"
                )
                .css
            )
            .toMatchSnapshot();
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            expect(
                process(
                    "@-webkit-keyframes kooga {} .wooga { animation: kooga; }"
                )
                .css
            )
            .toMatchSnapshot();
        });
    });
});
