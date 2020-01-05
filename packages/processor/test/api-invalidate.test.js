"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".invalidate()", () => {
        let processor;

        const status = (source) =>
            Object.entries(source).map(([ key, value ]) =>
                ([ relative([ key ])[0], value.valid ])
            );

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });


        it("should invalidate a relative file", async () => {
            await processor.string(
                "./simple.css",
                ".wooga { }"
            );

            processor.invalidate("./simple.css");

            expect(status(processor.files)).toMatchSnapshot();
        });

        it("should invalidate an absolute file", async () => {
            await processor.string(
                "./packages/processor/test/specimens/simple.css",
                ".wooga { }"
            );

            processor.invalidate(require.resolve("./specimens/simple.css"));

            expect(status(processor.files)).toMatchSnapshot();
        });

        it("should throw if no file is passed", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            expect(() => processor.invalidate()).toThrowErrorMatchingSnapshot();
        });

        it("should throw if an invalid file is passed", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            expect(() => processor.invalidate("nope.css")).toThrowErrorMatchingSnapshot();
        });

        it("should invalidate all dependents as well", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            processor.invalidate("./packages/processor/test/specimens/folder/folder.css");

            expect(status(processor.files)).toMatchSnapshot();
        });

        it("should reprocess invalidated files", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            processor.invalidate("./packages/processor/test/specimens/start.css");

            await processor.file("./packages/processor/test/specimens/start.css");

            expect(status(processor.files)).toMatchSnapshot();
        });
    });
});
