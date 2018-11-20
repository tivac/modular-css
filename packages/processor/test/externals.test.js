"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("externals", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });
        
        it("should fail if not a valid composition reference", () =>
            processor.string(
                "./invalid-external.css",
                dedent(`
                    :external(some garbage here) { }
                `)
            )
            .catch(({ message }) => expect(message).toMatch(`SyntaxError: Expected`)
            )
        );

        it("should fail if not referencing another file", () =>
            processor.string(
                "./invalid-external.css",
                dedent(`
                    :external(a) { }
                `)
            )
            .catch(({ message }) => expect(message).toMatch(`externals must be from another file`)
            )
        );

        it("should fail on bad class references", () =>
            processor.file(require.resolve("./specimens/externals-invalid.css"))
            .catch(({ message }) => expect(message).toMatch(`Invalid external reference: nopenopenope`)
            )
        );
        
        it("should support overriding external values", () =>
            processor.file(
                "./packages/processor/test/specimens/externals.css"
            )
            .then(() => processor.output())
            .then(({ css }) => expect(css).toMatchSnapshot()
            )
        );
    });
});
