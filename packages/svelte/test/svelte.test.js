"use strict";

const fs = require("fs");

const svelte = require("svelte");

const namer = require("test-utils/namer.js");
    
const plugin = require("../svelte.js");

describe("/rollup.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));
    
    it("should generate exports", async () => {
        const { processor, preprocess } = plugin({
            css : "./packages/svelte/test/output/svelte.css",
            namer
        });

        const filename = require.resolve("./specimens/svelte.html");
        
        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        const output = await processor.output();
        
        expect(output.css).toMatchSnapshot();
        expect(processed.toString()).toMatchSnapshot();
    });
});
