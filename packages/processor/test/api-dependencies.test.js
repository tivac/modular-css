"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".dependencies()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should return the dependencies of the specified file", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            expect(
                relative(processor.dependencies(require.resolve("./specimens/start.css")))
            )
            .toMatchSnapshot();
        });

        it("should return the overall order of dependencies if no file is specified", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            expect(relative(processor.dependencies())).toMatchSnapshot();
        });
    });
});
