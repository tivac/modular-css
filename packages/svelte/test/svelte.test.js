"use strict";

const fs = require("fs");
const path = require("path");

const svelte = require("svelte/compiler");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const namer = require("@modular-css/test-utils/namer.js");
const logs  = require("@modular-css/test-utils/logs.js");

const plugin = require("../svelte.js");

describe("/svelte.js", () => {
    let warnSpy;

    beforeEach(() => {
        warnSpy = logs("warn");
    });

    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));

    it("should extract CSS from a <style> tag", async () => {
        const filename = require.resolve("./specimens/style.html");
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
    ])("should expose CSS errors in a useful way (<%s>)", async (type) => {
        const filename = require.resolve(`./specimens/error-${type}.html`);
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
            const filename = require.resolve(`./specimens/error-link-non-css.html`);
            const { preprocess } = plugin({
                namer,
            });

            await expect(svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                {
                    ...preprocess,
                    filename,
                },
            )).rejects.toThrow("error-link.html:1:1: Unknown word");

            expect(warnSpy).toHaveBeenCalled();
            expect(warnSpy.mock.calls).toMatchSnapshot();
        }
    );

    it("should ignore <links> that reference a URL", async () => {
        const filename = require.resolve("./specimens/url.html");
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

        const filename = require.resolve("./specimens/url.html");
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

    it.each([
        [ "no script", "external.html" ],
        [ "existing script", "external-script.html" ],
        [ "single quotes", "external-single.html" ],
        [ "unquoted", "external-unquoted.html" ],
        [ "values", "external-values.html" ],
    ])("should extract CSS from a <link> tag (%s)", async (title, specimen) => {
        const filename = require.resolve(`./specimens/${specimen}`);
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
        [ "invalid reference <script> - <style>", "invalid-inline-script.html" ],
        [ "invalid reference template - <style>", "invalid-inline-template.html" ],
        [ "invalid reference <script> - <link>", "invalid-external-script.html" ],
        [ "invalid reference template - <link>", "invalid-external-template.html" ],
        [ "empty css file - <style>", "invalid-inline-empty.html" ],
        [ "empty css file - <link>", "invalid-external-empty.html" ],
    ])("should handle errors: %s", async (title, specimen) => {
        const filename = require.resolve(`./specimens/${specimen}`);

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

        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls).toMatchSnapshot();

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
                {
                    ...preprocess,
                    filename,
                },
            )
        ).rejects.toThrowErrorMatchingSnapshot();
    });

    it.each([
        [ "<style>", "style.html" ],
        [ "<link>", "external.html" ],
    ])("should support verbose output: %s", async (title, specimen) => {
        const spy = logs();

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

        expect(spy.calls()).toMatchSnapshot();
    });

    it("should warn when multiple <link> elements are in the html", async () => {
        const filename = require.resolve(`./specimens/multiple-link.html`);

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

        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls).toMatchSnapshot();
    });

    it("should no-op if all <link>s reference a URL", async () => {
        const filename = require.resolve("./specimens/multiple-url.html");

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
            {
                ...preprocess,
                filename,
            },
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
                require.resolve("./specimens/overlapping/entry1.html"),
                require.resolve("./specimens/overlapping/entry2.html"),
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

        const filename = require.resolve("./specimens/link-resolving.html");
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

    it("should warn about unquoted class attributes", async () => {
        const filename = require.resolve("./specimens/unquoted.html");
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

        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls).toMatchSnapshot();
    });

    it("should ignore <Link />", async () => {
        const filename = require.resolve("./specimens/link-component.html");
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

        expect(warnSpy).not.toHaveBeenCalled();
    });
});
