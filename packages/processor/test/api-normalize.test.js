"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".normalize()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should normalize inputs", async () => {
            expect(
                relative([ processor.normalize("../modular-css/simple.css") ])
            ).toMatchSnapshot();
        });
    });
});
