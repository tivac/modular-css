"use strict";

const namer = require("@modular-css/test-utils/namer.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".string()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should process a string", async () => {
            const result = await processor.string(
                "./simple.css", ".wooga { }"
            );

            expect(result.exports).toMatchSnapshot();
            expect(result.details.exports).toMatchSnapshot();
            expect(result.details.text).toMatchSnapshot();
            expect(result.details.processed.root.toResult().css).toMatchSnapshot();
        });
    });
});
