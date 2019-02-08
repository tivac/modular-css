"use strict";

const fs = require("fs");
const path = require("path");

const svelte = require("svelte");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const namer = require("@modular-css/test-utils/namer.js");
const logs  = require("@modular-css/test-utils/logs.js");

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
    
    it("should ignore <links> that reference a URL", async () => {
        const filename = require.resolve("./specimens/url.html");
        const { preprocess, processor } = plugin({
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

    it("should use an already-created processor", async () => {
        const processor = new Processor({ namer });

        await processor.string(
            "./fake.css",
            ".fake { color: #F00; }"
        );

        const filename = require.resolve("./specimens/url.html");
        const { preprocess } = plugin({
            processor,
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
        specimen                    | title
        ${"external.html"}          | ${"no script"}
        ${"external-script.html"}   | ${"existing script"}
        ${"external-single.html"}   | ${"single quotes"}
        ${"external-unquoted.html"} | ${"unquoted"}
        ${"external-values.html"}   | ${"values"}
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
        title                                     | specimen
        ${"invalid reference <script> - <style>"} | ${"invalid-inline-script.html"}
        ${"invalid reference template - <style>"} | ${"invalid-inline-template.html"}
        ${"invalid reference <script> - <link>"}  | ${"invalid-external-script.html"}
        ${"invalid reference template - <link>"}  | ${"invalid-external-template.html"}
        ${"empty css file - <style>"}             | ${"invalid-inline-empty.html"}
        ${"empty css file - <link>"}              | ${"invalid-external-empty.html"}
    `("should handle errors: $title", async ({ specimen }) => {
        const spy = jest.spyOn(global.console, "warn");

        spy.mockImplementation(() => { /* NO-OP */ });

        const filename = require.resolve(`./specimens/${specimen}`);

        // Set up strict plugin
        const { preprocess : strict } = plugin({
            namer,
            strict : true,
        });

        await expect(
            svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                Object.assign({}, strict, { filename })
            )
        ).rejects.toThrowErrorMatchingSnapshot();

        // Now the loose plugin
        const { preprocess : loose } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, loose, { filename })
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

    it.each`
        title        | specimen
        ${"<style>"} | ${"style.html"}
        ${"<link>"}  | ${"external.html"}
    `("should support verbose output: $title", async ({ specimen }) => {
        const { logSnapshot } = logs();

        const filename = require.resolve(`./specimens/${specimen}`);

        const { processor, preprocess } = plugin({
            namer,
            verbose : true,
        });

        await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        await processor.output();

        logSnapshot();
    });

    it("should warn when multiple <link> elements are in the html", async () => {
        const spy = jest.spyOn(global.console, "warn");

        spy.mockImplementation(() => { /* NO-OP */ });

        const filename = require.resolve(`./specimens/multiple-link.html`);

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
        
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls).toMatchSnapshot();
    });

    it("should no-op if all <link>s reference a URL", async () => {
        const filename = require.resolve("./specimens/multiple-url.html");
        
        const { preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();
    });
    

    it("should invalidate files before reprocessing (<link>)", async () => {
        // V1 of files
        fs.writeFileSync(path.resolve(__dirname, "./output/source.html"), dedent(`
            <link rel="stylesheet" href="./source.css" />
            <div class="{css.source}">Source</div>
        `));

        fs.writeFileSync(path.resolve(__dirname, "./output/source.css"), dedent(`
            .source {
                color: red;
            }
        `));

        const filename = require.resolve(`./output/source.html`);
        const { processor, preprocess } = plugin({
            namer,
        });

        let processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();

        let output = await processor.output();

        expect(output.css).toMatchSnapshot();

        // V2 of CSS
        fs.writeFileSync(path.resolve(__dirname, "./output/source.css"), dedent(`
            .source {
                color: blue;
            }
        `));

        processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();

        output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should invalidate files before reprocessing (<style>)", async () => {
        // V1 of files
        fs.writeFileSync(path.resolve(__dirname, "./output/source.html"), dedent(`
            <style>.source { color: red; }</style>
            <div class="{css.source}">Source</div>
        `));

        const filename = require.resolve(`./output/source.html`);
        const { processor, preprocess } = plugin({
            namer,
        });

        let processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();

        let output = await processor.output();

        expect(output.css).toMatchSnapshot();

        // V2 of CSS
        fs.writeFileSync(path.resolve(__dirname, "./output/source.html"), dedent(`
            <style>.source { color: blue; }</style>
            <div class="{css.source}">Source</div>
        `));

        processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        );

        expect(processed.toString()).toMatchSnapshot();

        output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should wait for files to finish", async () => {
        const { preprocess } = plugin({
            namer,
        });

        const results = await Promise.all(
            [
                require.resolve("./specimens/overlapping/entry1.html"),
                require.resolve("./specimens/overlapping/entry2.html"),
            ]
            .map((filename) => svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                Object.assign({}, preprocess, { filename })
            ))
        );

        expect(results.map((result) => result.toString())).toMatchSnapshot();
    });
});
