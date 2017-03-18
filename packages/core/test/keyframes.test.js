"use strict";

var postcss = require("postcss"),
    dedent  = require("dedent"),
    
    scoping   = require("../plugins/scoping.js"),
    keyframes = require("../plugins/keyframes.js");

function namer(file, selector) {
    return `${selector}_`;
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
            expect(process(dedent(`
                    .a { animation: a; }
                    .b { animation-name: b; }
                `)).css
            )
            .toMatchSnapshot();
        });
        
        it("should update scoped animations from the scoping plugin's message", function() {
            expect(process(dedent(`
                    @keyframes a {}
                    .b { animation: a; }
                `)).css
            )
            .toMatchSnapshot();
        });

        it("should update the animation-name property", function() {
            expect(process(dedent(`
                    @keyframes a {}
                    .b { animation-name: a; }
                `)).css
            )
            .toMatchSnapshot();
        });

        // Issue 208
        it("should update multiple animations properly", function() {
            expect(process(dedent(`
                    @keyframes a {}
                    @keyframes b {}
                    .c { animation: a 10s linear, b 0.2s infinite; }
                `)).css
            )
            .toMatchSnapshot();
        });

        it("should update scoped prefixed animations from the scoping plugin's message", function() {
            expect(process(dedent(`
                    @-webkit-keyframes a {}
                    .b { animation: a; }
                `)).css
            )
            .toMatchSnapshot();
        });
    });
});
