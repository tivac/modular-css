"use strict";

var dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("values", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });
        
        it("should fail on invalid value syntax", () =>
            processor.string(
                "./invalid/value.css",
                "@value foo, bar from nowhere.css"
            )
            .catch((error) =>
                expect(error.message).toMatch(`SyntaxError: Expected source but "n" found.`)
            )
        );

        it("should fail if a value imports a non-existant reference", () =>
            processor.string(
                "./invalid/value.css",
                "@value not-real from \"../local.css\";"
            )
            .catch((error) =>
                expect(error.message).toMatch(`Unable to locate "../local.css" from`)
            )
        );

        it("should support simple values", () =>
            processor.string(
                "./values.css",
                dedent(`
                    @value a: red;

                    .a { color: a; }
                `)
            )
            .then(() => processor.output())
            .then((result) =>
                expect(result.css).toMatchSnapshot()
            )
        );
        
        it("should support local values in value composition", () =>
            processor.string(
                "./packages/core/test/specimens/simple.css",
                dedent(`
                    @value o: one;
                    @value local: './local.css';
                    @value o from local;
                    .fooga { background: one; }
                `)
            )
            .then((result) =>
                expect(result.exports).toMatchSnapshot()
            )
        );

        it("should support value composition", () =>
            processor.file(require.resolve("./specimens/value-composition.css"))
            .then(() => processor.output())
            .then((result) =>
                expect(result.css).toMatchSnapshot()
            )
        );

        it("should support value namespaces", () =>
            processor.file(require.resolve("./specimens/value-namespace.css"))
            .then(() => processor.output())
            .then((result) =>
                expect(result.css).toMatchSnapshot()
            )
        );

        it("should support value replacement in :external(...)", () =>
            processor.file(require.resolve("./specimens/externals.css"))
            .then(() => processor.output())
            .then((result) =>
                expect(result.css).toMatchSnapshot()
            )
        );
    });
});
