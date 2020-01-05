"use strict";

const namer = require("@modular-css/test-utils/namer.js");
const relative = require("@modular-css/test-utils/relative.js");

const Processor = require("../processor.js");

describe("/processor.js", () => {
    describe(".unused()", () => {
        let processor;

        beforeEach(() => {
            processor = new Processor({
                namer,
            });
        });

        it("should return a map of unused exports", async () => {
            await processor.file("./packages/processor/test/specimens/simple.css");
            await processor.file("./packages/processor/test/specimens/start.css");
            await processor.file("./packages/processor/test/specimens/at-composes.css");
            await processor.file("./packages/processor/test/specimens/composes-global.css");
            await processor.file("./packages/processor/test/specimens/global.css");

            processor._used(
                processor._normalize("./packages/processor/test/specimens/simple.css"),
                "wooga"
            );
            
            processor._used(
                processor._normalize("./packages/processor/test/specimens/start.css"),
                "wooga"
            );

            processor._used(
                processor._normalize("./packages/processor/test/specimens/composes-global.css"),
                "two",
            );

            const unused = processor.unused();

            expect(unused).toBeInstanceOf(Map);

            // Absolute file paths hork things up, so need to transform this
            const expected = [ ...unused.entries() ].map(([ file, classes ]) => [
                relative(file)[0],
                classes,
            ]);
            
            expect(expected).toMatchSnapshot();
        });
    });
});
