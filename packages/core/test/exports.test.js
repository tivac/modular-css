"use strict";

var dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("exports", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });
        
        it("should export an object of arrays containing strings", () =>
            processor.string(
                "./simple.css",
                dedent(`
                    .red { color: red; }
                    .black { background: #000; }
                    .one, .two { composes: red, black; }
                `)
            )
            .then((result) =>
                expect(result.exports).toMatchSnapshot()
            )
        );

        it("should export identifiers and their classes", () =>
            processor.file(
                "./packages/core/test/specimens/start.css"
            )
            .then(() => processor.output())
            .then((output) =>
                expect(output.compositions).toMatchSnapshot()
            )
        );
    });
});
