"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".remove()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });
            
        it("should remove a relative file", async () => {
            await processor.string(
                "./simple.css",
                ".wooga { }"
            );

            processor.remove("./simple.css");

            expect(relative(processor.dependencies())).toMatchSnapshot();
        });

        it("should remove an absolute file", async () => {
            await processor.string(
                "./packages/processor/test/specimens/simple.css",
                ".wooga { }"
            );

            processor.remove(require.resolve("./specimens/simple.css"));

            expect(relative(processor.dependencies())).toMatchSnapshot();
        });

        it("should remove multiple files", async () => {
            await processor.string("./a.css", ".a { }");
            await processor.string("./b.css", ".b { }");
            await processor.string("./c.css", ".c { }");

            processor.remove([
                "./a.css",
                "./b.css",
            ]);

            expect(relative(processor.dependencies())).toMatchSnapshot();
        });

        it("should return an array of removed files", async () => {
            await processor.string("./a.css", ".a { }");
            await processor.string("./b.css", ".b { }");
            await processor.string("./c.css", ".c { }");

            expect(
                relative(
                    processor.remove([
                        "./a.css",
                        "./b.css",
                    ])
                )
            ).toMatchSnapshot();
        });
    });
});
