"use strict";

var fs     = require("fs"),
    path   = require("path"),
    
    compare = require("./lib/compare-files.js"),

    Processor = require("../src/processor");

describe("/issues", function() {
    describe("/191", function() {
        afterAll((done) => require("rimraf")("./test/output/sensitive.txt", done));

        it("should ignore case differences in file paths", function() {
            var test = this,
                processor;
            
            // Verify that filesystem is case-insensitive before bothering
            fs.writeFileSync("./test/output/sensitive.txt");

            try {
                fs.statSync("./test/output/SENSITIVE.txt");
            } catch(e) {
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
