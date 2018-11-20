"use strict";

const dedent = require("dedent");
const namer  = require("@modular-css/test-utils/namer.js");
const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("exports", () => {
        let processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer,
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
                "./packages/processor/test/specimens/start.css"
            )
            .then(() => processor.output())
            .then((output) =>
                expect(output.compositions).toMatchSnapshot()
            )
        );
    });
});
