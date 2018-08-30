"use strict";

var namer  = require("@modular-css/test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("unicode", () => {
        var processor;
        
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
