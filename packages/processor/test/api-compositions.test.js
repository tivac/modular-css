"use strict";

const namer = require("@modular-css/test-utils/namer.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".compositions", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should return compositions for loaded files", async () => {
            await processor.file(require.resolve("./specimens/start.css"));

            await expect(processor.compositions).resolves.toMatchSnapshot();
        });
    });
});
