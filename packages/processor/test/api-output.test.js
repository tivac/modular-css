"use strict";

const namer = require("@modular-css/test-utils/namer.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".output()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should reject unknown files", async () => {
            await expect(processor.output({
                files : [
                    "./not/a/real/file",
                ],
            })).rejects.toThrow("Unknown file requested");
        });

        it("should return a postcss result", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });

        it("should generate css representing the output from all added files", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");
            await processor.file("./packages/processor/test/specimens/simple.css");

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });

        it("should avoid duplicating files in the output", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");
            await processor.file("./packages/processor/test/specimens/local.css");

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });

        it("should generate a JSON structure of all the compositions", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            const result = await processor.output();

            expect(result.compositions).toMatchSnapshot();
        });

        it("should order output by dependencies, then alphabetically", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");
            await processor.file("./packages/processor/test/specimens/local.css");
            await processor.file("./packages/processor/test/specimens/composes.css");
            await processor.file("./packages/processor/test/specimens/deep.css");

            const result = await processor.output();

            expect(result.css).toMatchSnapshot();
        });

        it("should support returning output for specified relative files", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");
            await processor.file("./packages/processor/test/specimens/local.css");

            const result = await processor.output({
                files : [
                    "./packages/processor/test/specimens/start.css",
                ],
            });

            expect(result.css).toMatchSnapshot();
        });

        it("should support returning output for specified absolute files", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");
            await processor.file("./packages/processor/test/specimens/local.css");

            const result = await processor.output({
                files : [
                    require.resolve("./specimens/start.css"),
                ],
            });

            expect(result.css).toMatchSnapshot();
        });

        it("should allow for seperate source map output", async () => {
            await processor.file("./packages/processor/test/specimens/start.css");

            const result = await processor.output({
                map : {
                    inline : false,
                },
            });

            expect(result.map).toMatchSnapshot();
        });
    });
});
