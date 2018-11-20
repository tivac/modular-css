"use strict";

const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("unicode", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should support unicode classes & ids", () =>
            processor.file(
                require.resolve("./specimens/unicode.css")
            )
            .then(() => processor.output({
                to : "./packages/processor/test/output/unicode.css",
            }))
            .then((output) =>
                expect(output.css).toMatchSnapshot()
            )
        );
    });
});
