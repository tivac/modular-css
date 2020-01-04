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
            await processor.string(
                "./one.css",
                ".one1 { } .one2 { }",
            );
            
            await processor.string(
                "./two.css",
                ".two1 { } .two2 { }",
            );

            processor._used(processor._normalize("./one.css"), "one1");
            processor._used(processor._normalize("./two.css"), "two2");

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
