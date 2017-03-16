"use strict";

var fs     = require("fs"),
    
    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),

    Processor = require("../processor.js");

describe("/issues", function() {
    describe("/191", function() {
        afterAll(() => require("shelljs").rm("-rf", "./packages/core/test/output/sensitive.txt"));

        it("should ignore case differences in file paths", function() {
            var processor;
            
            // Verify that filesystem is case-insensitive before bothering
            fs.writeFileSync("./packages/core/test/output/sensitive.txt");

            try {
                fs.statSync("./packages/core/test/output/SENSITIVE.txt");
            } catch(e) {
                return this.skip();
            }

            processor = new Processor({
                namer
            });
            
            return processor.file("./packages/core/test/specimens/issues/191/start.css")
                .then(() => processor.output())
                .then((output) =>
                    compare.stringToFile(output.css, "./packages/core/test/results/issues/191.css")
                );
        });
    });
});
