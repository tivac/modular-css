"use strict";

var fs     = require("fs"),
    path   = require("path"),
    
    compare = require("./lib/compare-files.js"),

    Processor = require("../src/processor");

describe("/issues", () => {
    describe("/191", () => {
        after((done) => require("rimraf")("./test/output/sensitive.txt", done));

        it("should ignore case differences in file paths", () => {
            var processor;
            
            // Verify that filesystem is case-insensitive before bothering
            fs.writeFileSync("./test/output/sensitive.txt");

            if(!fs.statSync("./test/output/SENSITIVE.txt")) {
                return this.skip();
            }

            processor = new Processor();
            
            return processor.file("./test/specimens/issues/191/start.css")
                .then(() => processor.output())
                .then((output) =>
                    compare.stringToFile(output.css, "./test/results/issues/191.css")
                );
        });
    });
});
