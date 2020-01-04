"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".dependents()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should return the dependents of the specified file", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            expect(
                relative(processor.dependents(require.resolve("./specimens/local.css")))
            )
            .toMatchSnapshot();
        });

        it("should throw if no file is passed", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            expect(() => processor.dependents()).toThrowErrorMatchingSnapshot();
        });
    });
});
