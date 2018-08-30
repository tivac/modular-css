"use strict";

var fs = require("fs"),
    
    namer = require("@modular-css/test-utils/namer.js"),

    Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/191", () => {
        var fn = it;
        
        afterAll(() => require("shelljs").rm("-rf", "./packages/processor/test/output/sensitive.txt"));

        // Verify that filesystem is case-insensitive before bothering
        fs.writeFileSync("./packages/processor/test/output/sensitive.txt");

        try {
            fs.statSync("./packages/processor/test/output/SENSITIVE.txt");
        } catch(e) {
            fn = it.skip;
        }

        fn("should ignore case differences in file paths", () => {
            var processor = new Processor({
                    namer,
                });
            
            return processor.file(require.resolve("./specimens/191/start.css"))
                .then(() => processor.output())
                .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
