"use strict";

var path = require("path"),
    
    namer  = require("test-utils/namer.js"),
    
    Processor = require("../processor.js");

function relative(files) {
    return files.map((file) => path.relative(process.cwd(), file));
}

describe("/processor.js", () => {
    describe("getters", () => {
        var processor;
        
        beforeEach(() => {
            processor = new Processor({
                namer
            });
        });
        
        describe(".file", () => {
            it("should return all the files that have been added", () =>
                processor.file(
                    "./packages/core/test/specimens/start.css"
                )
                .then(() => processor.file("./packages/core/test/specimens/local.css"))
                .then(() =>
                    expect(
                        relative(Object.keys(processor.files))
                    )
                    .toMatchSnapshot()
                )
            );
        });

        describe(".options", () => {
            it("should return the merged options object", () =>
                expect(typeof processor.options).toBe("object")
            );
        });
    });
});
