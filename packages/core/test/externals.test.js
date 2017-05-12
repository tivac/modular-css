"use strict";

var namer = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

describe("/processor.js", () => {
    describe("externals", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });
        
        it("should support overriding external values", () =>
            processor.file(
                "./packages/core/test/specimens/externals.css"
            )
            .then(() => processor.output())
            .then((result) =>
                expect(result.css).toMatchSnapshot()
            )
        );
    });
});
