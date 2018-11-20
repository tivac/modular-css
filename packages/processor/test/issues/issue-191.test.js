"use strict";

const fs = require("fs");
const namer = require("@modular-css/test-utils/namer.js");
const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/191", () => {
        let fn = it;
        
        afterAll(() => require("shelljs").rm("-rf", "./packages/processor/test/output/sensitive.txt"));

        // Verify that filesystem is case-insensitive before bothering
        fs.writeFileSync("./packages/processor/test/output/sensitive.txt");

        try {
            fs.statSync("./packages/processor/test/output/SENSITIVE.txt");
        } catch(e) {
            fn = it.skip;
        }

        fn("should ignore case differences in file paths", () => {
            const processor = new Processor({
                    namer,
                });
            
            return processor.file(require.resolve("./specimens/191/start.css"))
                .then(() => processor.output())
                .then(({ css }) => expect(css).toMatchSnapshot());
        });
    });
});
