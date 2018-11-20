"use strict";

const path = require("path");
const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("composition", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should fail on invalid composes syntax", () =>
            processor.string(
                "./invalid/value.css",
                ".a { composes: b from nowhere.css; }"
            )
            .catch(({ message }) => expect(message).toMatch(`SyntaxError: Expected source but "n" found.`)
            )
        );
        
        it("should fail if a composition references a non-existant class", () =>
            processor.string(
                "./invalid-composition.css",
                ".a { composes: b; }"
            )
            .catch(({ message }) => expect(message).toMatch(`Invalid composes reference`)
            )
        );
        
        it("should fail if a composition references a non-existant file", () =>
            processor.string(
                "./invalid-composition.css",
                ".a { composes: b from \"../local.css\"; }"
            )
            .catch(({ message }) => expect(message).toMatch(
                `Unable to locate "../local.css" from "${path.resolve("invalid-composition.css")}"`
            )
            )
        );

        it("should fail if composes isn't the first property", () =>
            processor.string(
                "./invalid/composes-first.css",
                dedent(`
                    .a { color: red; }
                    .b {
                        color: blue;
                        composes: a;
                    }
                `)
            )
            .catch(({ message }) => expect(message).toMatch(`composes must be the first declaration`)
            )
        );

        it("should fail on rules that use multiple selectors", () =>
            processor.string(
                "./invalid/composes-first.css",
                dedent(`
                    .a { color: red; }
                    .b .c { composes: a; }
                `)
            )
            .catch(({ message }) => expect(message).toMatch(`Only simple singular selectors may use composition`)
            )
        );

        it("should compose a single class", () =>
            processor.string(
                "./single-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { composes: a; }
                `)
            )
            .then(() => processor.output())
            .then(({ compositions }) => expect(compositions).toMatchSnapshot()
            )
        );

        it("should allow comments before composes", () =>
            processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b {
                        /* comment */
                        composes: a;
                    }
                `)
            )
            .then(() => processor.output())
            .then(({ compositions }) => expect(compositions).toMatchSnapshot()
            )
        );

        it("should compose from globals", () =>
            processor.string(
                "./global-compose.css",
                dedent(`
                    .a { composes: global(b); }
                `)
            )
            .then(() => processor.output())
            .then(({ compositions }) => expect(compositions).toMatchSnapshot()
            )
        );

        it("should compose multiple classes", () =>
            processor.string(
                "./multiple-composes.css",
                dedent(`
                    .a { color: red; }
                    .b { color: blue; }
                    .c {
                        composes: a;
                        composes: b;
                    }
                `)
            )
            .then(() => processor.output())
            .then(({ compositions }) => expect(compositions).toMatchSnapshot()
            )
        );
        
        it("should compose from other files", () =>
            processor.file(require.resolve("./specimens/composes.css"))
            .then(() => processor.output())
            .then(({ compositions }) => expect(compositions).toMatchSnapshot()
            )
        );
    });
});
