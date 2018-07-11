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

    it.each`
        title         | inline   | strict   | specimen
        ${"<script>"} | ${true}  | ${true}  | ${"invalid-inline-script.html"}
        ${"template"} | ${true}  | ${true}  | ${"invalid-inline-template.html"}
        ${"<script>"} | ${true}  | ${false} | ${"invalid-inline-script.html"}
        ${"template"} | ${true}  | ${false} | ${"invalid-inline-template.html"}
        ${"<script>"} | ${false} | ${false} | ${"invalid-external-script.html"}
        ${"template"} | ${false} | ${false} | ${"invalid-external-template.html"}
        ${"<script>"} | ${false} | ${true}  | ${"invalid-external-script.html"}
        ${"template"} | ${false} | ${true}  | ${"invalid-external-template.html"}
    `("should handle invalid references in $title (inline: $inline, strict: $strict)", async ({ strict, specimen }) => {
        const spy = jest.spyOn(global.console, "warn");

        spy.mockImplementation(() => { /* NO-OP */ });
        
        const filename = require.resolve(`./specimens/${specimen}`);

        const { preprocess } = plugin({
            namer,
            strict,
        });
        
        if(strict) {
            await expect(
                svelte.preprocess(
                    fs.readFileSync(filename, "utf8"),
                    Object.assign({}, preprocess, { filename })
                )
            ).rejects.toThrowErrorMatchingSnapshot();

            return;
        }

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );
        
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls).toMatchSnapshot();

        expect(processed.toString()).toMatchSnapshot();
    });

    it("should throw on both <style> and <link> in one file", async () => {
        const { preprocess } = plugin({
            css : "./packages/svelte/test/output/svelte.css",
            namer,
        });

        const filename = require.resolve("./specimens/both.html");

        await expect(
            svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                Object.assign({}, preprocess, { filename })
            )
        ).rejects.toThrowErrorMatchingSnapshot();
    });
});
