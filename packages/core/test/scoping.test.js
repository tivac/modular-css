"use strict";

var dedent = require("dedent"),
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("scoping", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });

        it("should scope classes, ids, and keyframes", () =>
            processor.string(
                "./simple.css",
                dedent(`
                    @keyframes kooga { }
                    #fooga { }
                    .wooga { }
                    .one,
                    .two { }
                `)
            )
            .then((result) => {
                expect(result.exports).toMatchSnapshot();

                return processor.output();
            })
            .then((output) =>
                expect(output.css).toMatchSnapshot()
            )
        );

        it("should handle pseudo classes correctly", () =>
            processor.string(
                "./simple.css",
                dedent(`
                    :global(.g1) {}
                    .b :global(.g2) {}
                    :global(#c) {}
                    .d:hover {}
                    .e:not(.e) {}
                `)
            )
            .then((result) => {
                expect(result.exports).toMatchSnapshot();

                return processor.output();
            })
            .then((output) =>
                expect(output.css).toMatchSnapshot()
            )
        );

        it("should not allow :global classes to overlap with local ones (local before global)", () =>
            processor.string(
                "./invalid/global.css",
                dedent(`
                    .a {}
                    :global(.a) {}
                `)
            )
            .catch((error) =>
                expect(error.message).toMatch(`Unable to re-use the same selector for global & local`)
            )
        );

        it("should not allow :global classes to overlap with local ones (global before local)", () =>
            processor.string(
                "./invalid/global.css",
                dedent(`
                    :global(.a) {}
                    .a {}
                `)
            )
            .catch((error) =>
                expect(error.message).toMatch(`Unable to re-use the same selector for global & local`)
            )
        );

        it("should not allow empty :global() selectors", () =>
            processor.string(
                "./invalid/global.css",
                ".a :global() { }"
            )
            .catch((error) =>
                expect(error.message).toMatch(`:global(...) must not be empty`)
            )
        );
    });
});
