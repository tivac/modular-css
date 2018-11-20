"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("scoping", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should leave unknown animation names alone", () =>
            processor.string(
                "./unknown-name.css",
                dedent(`
                    .a { animation: a; }
                    .b { animation-name: b; }
                `)
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );
        
        it("should update scoped animations from the scoping plugin's message", () =>
            processor.string(
                "./animation.css",
                dedent(`
                    @keyframes a {}
                    .b { animation: a; }
                `)
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should update the animation-name property", () =>
            processor.string(
                "./animation-name.css",
                dedent(`
                    @keyframes a {}
                    .b { animation-name: a; }
                `)
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        // Issue 208
        it("should update multiple animations properly", () =>
            processor.string(
                "./multiple-animations.css",
                dedent(`
                    @keyframes a {}
                    @keyframes b {}
                    .c { animation: a 10s linear, b 0.2s infinite; }
                `)
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should update scoped prefixed animations from the scoping plugin's message", () =>
            processor.string(
                "./prefixed-animations.css",
                dedent(`
                    @-webkit-keyframes a {}
                    .b { animation: a; }
                `)
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );
    });
});
