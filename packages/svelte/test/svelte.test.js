const { describe, it, afterEach } = require("node:test");

const fs = require("fs");
const path = require("path");

const svelte = require("svelte/compiler");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");
const namer = require("@modular-css/test-utils/namer.js");
const { logSpy, logSpyCalls }  = require("@modular-css/test-utils/logs.js");

const plugin = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));

    [
        [ "<style>", "style.svelte" ],
        [ "<script>", "script.svelte" ],
        [ "<link> no script", "link.svelte" ],
        [ "<link> existing script", "link-script.svelte" ],
        [ "<link> single quotes", "link-single.svelte" ],
        [ "<link> unquoted", "link-unquoted.svelte" ],
        [ "<link> values", "link-values.svelte" ],
    ].forEach(async ([ type, file ]) => {
        it(`should extract CSS - ${type}`, async (t) => {
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
    
            t.assert.snapshot(processed.toString());
    
            const output = await processor.output();
    
            t.assert.snapshot(output.css);
        });
    });


    it("should replace unquoted class attributes correctly", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    it("should ignore <style> tags without the text/m-css attribute", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    [
        "style",
        "link",
        "script",
    ].forEach((type) => {
        it(`should expose CSS errors in a useful way (<${type}>)`, async (t) => {
            const filename = require.resolve(`./specimens/error-${type}.svelte`);
            const { preprocess } = plugin({
                namer,
            });
    
            await t.assert.rejects(async () =>
                svelte.preprocess(
                    fs.readFileSync(filename, "utf8"),
                    {
                        ...preprocess,
                        filename,
                    },
                ),
                /\.wooga/,
            );
        });
    });

    it("should expose CSS errors in a useful way (non-css file)", async (t) => {
        const spy = logSpy("warn");

        const filename = require.resolve(`./specimens/error-link-non-css.svelte`);
        const { preprocess } = plugin({
            namer,
        });

        await t.assert.rejects(() =>
            svelte.preprocess(
                fs.readFileSync(filename, "utf8"),
                {
                    ...preprocess,
                    filename,
                },
            ),
            "error-link.svelte:1:1: Unknown word"
        );

        t.assert.ok(spy.calls.length > 0);
        t.assert.snapshot(logSpyCalls(spy));
    });

    it("should ignore <links> that reference a URL", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    it("should use an already-created processor", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    it("should ignore files without <style> blocks", async (t) => {
        const { processor, preprocess } = plugin();

        const processed = await svelte.preprocess(
            dedent(`
                <h1>Hello</h1>
                <script>console.log("output")</script>
            `),
            preprocess
        );

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    [
        [ "invalid reference <script> - <style>", "invalid-style-script.svelte" ],
        [ "invalid reference template - <style>", "invalid-style-template.svelte" ],
        [ "invalid reference <script> - <link>", "invalid-link-script.svelte" ],
        [ "invalid reference template - <link>", "invalid-link-template.svelte" ],
        [ "invalid reference <script> - <script>", "invalid-script-script.svelte" ],
        [ "invalid reference template - <script>", "invalid-script-template.svelte" ],
        [ "empty css file - <style>", "invalid-style-empty.svelte" ],
        [ "empty css file - <link>", "invalid-link-empty.svelte" ],
        [ "empty css file - <script>", "invalid-script-empty.svelte" ],
    ].forEach(([ title, specimen ]) => {
        it(`should handle errors: ${title}`, async (t) => {
            const filename = require.resolve(`./specimens/${specimen}`);
    
            const spy = logSpy("warn");
    
            // Set up strict plugin
            const { preprocess : strict } = plugin({
                namer,
                strict : true,
            });
    
            try {
                await svelte.preprocess(
                    fs.readFileSync(filename, "utf8"),
                    {
                        ...strict,
                        filename,
                    }
                );
            } catch(e) {
                t.assert.snapshot(e.toString());
            }
    
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
    
            t.assert.ok(spy.calls.length > 0);
            t.assert.snapshot(logSpyCalls(spy));
    
            t.assert.snapshot(processed.toString());
        });
    });


    [
        [ "<style>", "style.svelte" ],
        [ "<link>", "link.svelte" ],
        [ "<script>", "script.svelte" ],
    ].forEach(([ title, specimen ]) => {
        it(`should support verbose output: ${title}`, async (t) => {
            const spy = logSpy();

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

            t.assert.snapshot(logSpyCalls(spy));
        });
    });

    it("should warn when multiple <link> elements are in the html", async (t) => {
        const filename = require.resolve(`./specimens/multiple-link.svelte`);

        const spy = logSpy("warn");

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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);

         t.assert.ok(spy.calls.length > 0);
            t.assert.snapshot(logSpyCalls(spy));
    });

    it("should no-op if all <link>s reference a URL", async (t) => {
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

        t.assert.snapshot(processed.toString());
    });

    [
        [ "<link>",
            `<link rel="stylesheet" href="./source.css" />
            <div class="{css.source}">Source</div>`,
        ],
        [ "<script>",
            `<div class="{css.source}">Source</div>
            <script>import css from "./source.css";</script>`,
        ],
    ].forEach(([ type, source ]) => {
        it(`should invalidate files before reprocessing (${type})`, async (t) => {
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

            t.assert.snapshot(processed.toString());

            let output = await processor.output();

            t.assert.snapshot(output.css);

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

            t.assert.snapshot(processed.toString());

            output = await processor.output();

            t.assert.snapshot(output.css);
        });
    });

    it("should invalidate files before reprocessing (<style>)", async (t) => {
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

        t.assert.snapshot(processed.toString());

        let output = await processor.output();

        t.assert.snapshot(output.css);

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

        t.assert.snapshot(processed.toString());

        output = await processor.output();

        t.assert.snapshot(output.css);
    });

    it("should wait for files to finish", async (t) => {
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

        t.assert.snapshot(results.map((result) => result.toString()));
    });

    it("should use modular-css's file resolver", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    it("should ignore <Link />", async (t) => {
        const spy = logSpy("warn");

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

        t.assert.ok(spy.calls.length === 0);
    });

    it("should ignore imports that don't match the filter", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });

    it("should find imports in any <script> tag", async (t) => {
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

        t.assert.snapshot(processed.toString());

        const output = await processor.output();

        t.assert.snapshot(output.css);
    });
});
