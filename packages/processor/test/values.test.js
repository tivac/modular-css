"use strict";

const path = require("path");
const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("values", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });
        
        it("should fail on invalid value syntax", () =>
            processor.string(
                "./invalid/value.css",
                "@value foo, bar from nowhere.css"
            )
            .catch(({ message }) => expect(message).toMatch(`SyntaxError: Expected source but "n" found.`)
            )
        );

        it("should fail if a value imports a non-existant reference", () =>
            processor.string(
                "./invalid/value.css",
                "@value not-real from \"../local.css\";"
            )
            .catch(({ message }) => expect(message).toMatch(
                `Unable to locate "../local.css" from "${path.resolve("invalid/value.css")}"`
            )
            )
        );

        it("should support simple values", () =>
            processor.string(
                "./values.css",
                dedent(`
                    @value a: red;
                    @value b:
                        Segoe UI
                        sans-serif;

                    .a {
                        color: a;
                        font-family: b;
                    }
                `)
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should support local values in value composition", () =>
            processor.string(
                "./packages/processor/test/specimens/simple.css",
                dedent(`
                    @value o: one;
                    @value local: './local.css';
                    @value o from local;
                    .fooga { background: one; }
                `)
            )
            .then(({ exports }) => expect(exports).toMatchSnapshot()
            )
        );

        it("should support importing variables from a file", () =>
            processor.file(require.resolve("./specimens/value-import.css"))
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should support exporting imported variables", () =>
            processor.file(require.resolve("./specimens/value-export.css"))
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should support value composition", () =>
            processor.file(require.resolve("./specimens/value-composition.css"))
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should support value namespaces", () =>
            processor.file(require.resolve("./specimens/value-namespace.css"))
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );

        it("should support value replacement in :external(...)", () =>
            processor.file(require.resolve("./specimens/externals.css"))
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );
    });
});
