"use strict";

const fs = require("fs");
const path = require("path");

const svelte = require("svelte/compiler");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const namer = require("@modular-css/test-utils/namer.js");
const logspy  = require("@modular-css/test-utils/logs.js");

const plugin = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));

    it.each([
        [ "<style>", "style.svelte" ],
        [ "<script>", "script.svelte" ],
        [ "<link> no script", "link.svelte" ],
        [ "<link> existing script", "link-script.svelte" ],
        [ "<link> single quotes", "link-single.svelte" ],
        [ "<link> unquoted", "link-unquoted.svelte" ],
        [ "<link> values", "link-values.svelte" ],
    ])("should extract CSS - %s", async (type, file) => {
        const filename = require.resolve(`./specimens/${file}`);
        const { processor, preprocess } = plugin({
            namer,
            values : true,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should replace unquoted class attributes correctly", async () => {
        const filename = require.resolve(`./specimens/unquoted.svelte`);
        const { processor, preprocess } = plugin({
            namer,
            values : true,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should ignore <style> tags without the text/m-css attribute", async () => {
        const filename = require.resolve("./specimens/style-no-attribute.svelte");
        const { processor, preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it.each([
        "style",
        "link",
        "script",
    ])("should expose CSS errors in a useful way (<%s>)", async (type) => {
        const filename = require.resolve(`./specimens/error-${type}.svelte`);
        const { preprocess } = plugin({
            namer,
        });

        await expect(svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        )).rejects.toThrow(/\.wooga/);
    });

    it("should expose CSS errors in a useful way (non-css file)", async () => {
        const spy = logspy("warn");

        const filename = require.resolve(`./specimens/error-link-non-css.svelte`);
        const { preprocess } = plugin({
            namer,
        });

        await expect(svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        )).rejects.toThrow("error-link.svelte:1:1: Unknown word");

        expect(spy).toHaveBeenCalled();
        expect(spy).toMatchLogspySnapshot();
    });

    it("should ignore <links> that reference a URL", async () => {
        const filename = require.resolve("./specimens/url.svelte");
        const { preprocess, processor } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
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

        const filename = require.resolve("./specimens/url.svelte");
        const { preprocess } = plugin({
            processor,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
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

    it.each([
        [ "invalid reference <script> - <style>", "invalid-style-script.svelte" ],
        [ "invalid reference template - <style>", "invalid-style-template.svelte" ],
        [ "invalid reference <script> - <link>", "invalid-link-script.svelte" ],
        [ "invalid reference template - <link>", "invalid-link-template.svelte" ],
        [ "invalid reference <script> - <script>", "invalid-script-script.svelte" ],
        [ "invalid reference template - <script>", "invalid-script-template.svelte" ],
        [ "empty css file - <style>", "invalid-style-empty.svelte" ],
        [ "empty css file - <link>", "invalid-link-empty.svelte" ],
        [ "empty css file - <script>", "invalid-script-empty.svelte" ],
    ])("should handle errors: %s", async (title, specimen) => {
        const filename = require.resolve(`./specimens/${specimen}`);

        const spy = logspy("warn");

        // Set up strict plugin
        const { preprocess : strict } = plugin({
            namer,
            strict : true,
        });

        await expect(
            svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                {
                    ...strict,
                    filename,
                }
            )
        ).rejects.toThrowErrorMatchingSnapshot();

        // Now the loose plugin
        const { preprocess : loose } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...loose,
                filename,
            }
        );

        expect(spy).toHaveBeenCalled();
        expect(spy).toMatchLogspySnapshot();

        expect(processed.toString()).toMatchSnapshot();
    });

    it.each([
        [ "<style>", "style.svelte" ],
        [ "<link>", "link.svelte" ],
        [ "<script>", "script.svelte" ],
    ])("should support verbose output: %s", async (title, specimen) => {
        const spy = logspy();

        const filename = require.resolve(`./specimens/${specimen}`);

        const { processor, preprocess } = plugin({
            namer,
            verbose : true,
            values  : true,
        });

        await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        await processor.output();

        expect(spy).toMatchLogspySnapshot();
    });

    it("should warn when multiple <link> elements are in the html", async () => {
        const filename = require.resolve(`./specimens/multiple-link.svelte`);

        const spy = logspy("warn");

        const { processor, preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();

        expect(spy).toHaveBeenCalled();
        expect(spy).toMatchLogspySnapshot();
    });

    it("should no-op if all <link>s reference a URL", async () => {
        const filename = require.resolve("./specimens/multiple-url.svelte");

        const { preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();
    });

    it.each([
        [ "<link>",
            `<link rel="stylesheet" href="./source.css" />
            <div class="{css.source}">Source</div>`,
        ],
        [ "<script>",
            `<div class="{css.source}">Source</div>
            <script>import css from "./source.css";</script>`,
        ],
    ])("should invalidate files before reprocessing (%s)", async (type, source) => {
        // V1 of files
        fs.writeFileSync(path.resolve(__dirname, "./output/source.svelte"), dedent(source));

        fs.writeFileSync(path.resolve(__dirname, "./output/source.css"), dedent(`
            .source {
                color: red;
            }
        `));

        const filename = require.resolve(`./output/source.svelte`);
        const { processor, preprocess } = plugin({
            namer,
        });

        let processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
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
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should invalidate files before reprocessing (<style>)", async () => {
        // V1 of files
        fs.writeFileSync(path.resolve(__dirname, "./output/source.svelte"), dedent(`
            <style type="text/m-css">.source { color: red; }</style>
            <div class="{css.source}">Source</div>
        `));

        const filename = require.resolve(`./output/source.svelte`);
        const { processor, preprocess } = plugin({
            namer,
        });

        let processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        let output = await processor.output();

        expect(output.css).toMatchSnapshot();

        // V2 of CSS
        fs.writeFileSync(path.resolve(__dirname, "./output/source.svelte"), dedent(`
            <style type="text/m-css">.source { color: blue; }</style>
            <div class="{css.source}">Source</div>
        `));

        processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
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
                require.resolve("./specimens/overlapping/entry1.svelte"),
                require.resolve("./specimens/overlapping/entry2.svelte"),
            ]
            .map((filename) => svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                {
                    ...preprocess,
                    filename,
                },
            ))
        );

        expect(results.map((result) => result.toString())).toMatchSnapshot();
    });

    it("should use modular-css's file resolver", async () => {
        const processor = new Processor({
            namer,
            resolvers : [
                // Force all paths to resolve to a different file
                () => require.resolve("./specimens/simple.css"),
            ],
        });

        const filename = require.resolve("./specimens/link-resolving.svelte");
        const { preprocess } = plugin({
            processor,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should ignore <Link />", async () => {
        const spy = logspy("warn");

        const filename = require.resolve("./specimens/link-component.svelte");
        const { preprocess } = plugin({
            namer,
        });

        await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(spy).not.toHaveBeenCalled();
    });

    it("should ignore imports that don't match the filter", async () => {
        const filename = require.resolve("./specimens/script-unmatched.svelte");
        const { processor, preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });

    it("should find imports in any <script> tag", async () => {
        const filename = require.resolve("./specimens/script-multiple.svelte");
        const { processor, preprocess } = plugin({
            namer,
        });

        const processed = await svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            {
                ...preprocess,
                filename,
            },
        );

        expect(processed.toString()).toMatchSnapshot();

        const output = await processor.output();

        expect(output.css).toMatchSnapshot();
    });
});
