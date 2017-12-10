"use strict";

const fs = require("fs");

const svelte = require("svelte");
const dedent = require("dedent");

const namer = require("test-utils/namer.js");
    
const plugin = require("../svelte.js");

describe("/svelte.js", () => {
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

    it("should ignore files without <style> blocks", async () => {
        const { processor, preprocess } = plugin();

        const processed = await svelte.preprocess(
            dedent(`
                <h1>Hello</h1>
                <script>console.log("output")</script>
            `),
            preprocess
        );

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
        expect(processed.toString()).toMatchSnapshot();
    });

    it("should ignore invalid {{css.<key>}}", async () => {
        const { preprocess } = plugin({
            namer
        });

        const processed = await svelte.preprocess(
            dedent(`
                <h1 class="{{css.nope}}">Hello</h1>
                <h2 class="{{css.yup}}">World</h2>
                <style>.yup { color: red; }</style>
            `),
            Object.assign({}, preprocess, { filename : require.resolve("./specimens/svelte.html") })
        );
        
        expect(processed.toString()).toMatchSnapshot();
    });
});
