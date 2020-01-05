"use strict";

const namer = require("@modular-css/test-utils/namer.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".file()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should process a relative file", async () => {
            const result = await processor.file("./packages/processor/test/specimens/simple.css");

            expect(result.exports).toMatchSnapshot();
            expect(result.details.exports).toMatchSnapshot();
            expect(result.details.text).toMatchSnapshot();
            expect(result.details.processed.root.toResult().css).toMatchSnapshot();
        });

        it("should process an absolute file", async () => {
            const result = await processor.file(
                require.resolve("./specimens/simple.css")
            );

            expect(result.exports).toMatchSnapshot();
            expect(result.details.exports).toMatchSnapshot();
            expect(result.details.text).toMatchSnapshot();
            expect(result.details.processed.root.toResult().css).toMatchSnapshot();
        });

        it("should wait for dependencies to be processed before composing", async () => {
            const results = await Promise.all([
                processor.file(require.resolve("./specimens/overlapping/entry1.css")),
                processor.file(require.resolve("./specimens/overlapping/entry2.css")),
            ]);

            expect(results.map((result) => result.exports)).toMatchSnapshot();
        });
    });
});
