"use strict";

var fs = require("fs"),
    
    namer = require("test-utils/namer.js"),

    Processor = require("../../processor.js");

describe("/issues", function() {
    describe("/191", function() {
        var fn = it;
        
        afterAll(() => require("shelljs").rm("-rf", "./packages/core/test/output/sensitive.txt"));

        // Verify that filesystem is case-insensitive before bothering
        fs.writeFileSync("./packages/core/test/output/sensitive.txt");

        try {
            fs.statSync("./packages/core/test/output/SENSITIVE.txt");
        } catch(e) {
            fn = it.skip;
        }

        fn("should ignore case differences in file paths", function() {
            var processor = new Processor({
                    namer
                });
            
            return processor.file(require.resolve("./specimens/191/start.css"))
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
