"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    compare = require("./lib/compare-files.js"),

    Processor = require("../src/processor");

describe("/issues", () => {
    describe("/191", () => {
        it("should ignore case differences in file paths", () => {
            var processor = new Processor();
            
            return processor.file("./test/specimens/issues/191/start.css")
                .then(() => processor.output())
                .then((output) =>
                    compare.stringToFile(output.css, "./test/results/issues/191.css")
                );
        });
    });
});
