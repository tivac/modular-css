"use strict";

const fs = require("fs");

const svelte = require("svelte");
const dedent = require("dedent");

const namer = require("test-utils/namer.js");
    
const plugin = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));
    
    it("should extract CSS from a <style> tag", async () => {
        const filename = require.resolve("./specimens/style.html");
        const { processor, preprocess } = plugin({
            namer,
        });
        
        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();
        
        expect(output.css).toMatchSnapshot();
    });

    it.each`
        specimen | title
        ${"external.html"} | ${"no script"}
        ${"external-script.html"} | ${"existing script"}
        ${"external-single.html"} | ${"single quotes"}
        ${"external-unquoted.html"} | ${"unquoted"}
    `("should extract CSS from a <link> tag ($title)", async ({ specimen }) => {
        const filename = require.resolve(`./specimens/${specimen}`);
        const { processor, preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();
        
        expect(output.css).toMatchSnapshot();
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

        expect(processed.toString()).toMatchSnapshot();
            
        const output = await processor.output();
       
        expect(output.css).toMatchSnapshot();
    });

    it("should ignore invalid {css.<key>}", async () => {
        const { preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            dedent(`
                <h1 class="{css.nope}">Hello</h1>
                <h2 class="{css.yup}">World</h2>
                <style>.yup { color: red; }</style>
            `),
            Object.assign({}, preprocess, { filename : require.resolve("./specimens/style.html") })
        );
        
        expect(processed.toString()).toMatchSnapshot();
    });

    it("should throw on both <style> and <link> in one file", () => {
        const { preprocess } = plugin({
            css : "./packages/svelte/test/output/svelte.css",
            namer,
        });

        const filename = require.resolve("./specimens/both.html");

        return svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        )
        .catch((error) =>
            expect(error.message).toMatch("modular-css-svelte supports <style> OR <link>, but not both")
        );
    });
});
