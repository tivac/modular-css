"use strict";

const namer = require("@modular-css/test-utils/namer.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".has()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should return a boolean", async () => {
            await processor.string(
                "./simple.css",
                ".wooga { }"
            );

            expect(processor.has("./simple.css")).toBe(true);
            expect(processor.has("./nope.css")).toBe(false);
        });

        it("should normalize inputs before checking for existence", async () => {
            await processor.string(
                "./simple.css",
                ".wooga { }"
            );

            expect(processor.has("../modular-css/simple.css")).toBe(true);
        });
    });
});
