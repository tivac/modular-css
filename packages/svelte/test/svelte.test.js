"use strict";

const fs = require("fs");

const svelte = require("svelte");
const dedent = require("dedent");

const namer = require("test-utils/namer.js");
    
const plugin = require("../svelte.js");

describe("/svelte.js", () => {
    afterEach(() => require("shelljs").rm("-rf", "./packages/svelte/test/output/*"));
    
    it("should generate exports", () => {
        const { processor, preprocess } = plugin({
            css : "./packages/svelte/test/output/svelte.css",
            namer
        });

        const filename = require.resolve("./specimens/svelte.html");
        
        return svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        )
        .then((processed) => {
            expect(processed.toString()).toMatchSnapshot();

            return processor.output();
        })
        .then((output) =>
            expect(output.css).toMatchSnapshot()
        );
    });

    it("should support external css via <link>", () => {
        const { processor, preprocess } = plugin({
            css : "./packages/svelte/test/output/svelte.css",
            namer
        });

        const filename = require.resolve("./specimens/svelte-external.html");

        return svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        )
        .then((processed) => {
            expect(processed.toString()).toMatchSnapshot();

            return processor.output();
        })
        .then((output) =>
            expect(output.css).toMatchSnapshot()
        );
    });

    it("should ignore files without <style> blocks", () => {
        const { processor, preprocess } = plugin();

        return svelte.preprocess(
            dedent(`
                <h1>Hello</h1>
                <script>console.log("output")</script>
            `),
            preprocess
        )
        .then((processed) => {
            expect(processed.toString()).toMatchSnapshot();
            
            return processor.output();
        })
        .then((output) =>
            expect(output.css).toMatchSnapshot()
        );
    });

    it("should ignore invalid {css.<key>}", () => {
        const { preprocess } = plugin({
            namer
        });

        return svelte.preprocess(
            dedent(`
                <h1 class="{css.nope}">Hello</h1>
                <h2 class="{css.yup}">World</h2>
                <style>.yup { color: red; }</style>
            `),
            Object.assign({}, preprocess, { filename : require.resolve("./specimens/svelte.html") })
        )
        .then((processed) =>
            expect(processed.toString()).toMatchSnapshot()
        );
    });

    it("should throw on both <style> and <link> in one file", () => {
        const { preprocess } = plugin({
            css : "./packages/svelte/test/output/svelte.css",
            namer
        });

        const filename = require.resolve("./specimens/svelte-both.html");

        return svelte.preprocess(
            fs.readFileSync(filename, "utf8"),
            Object.assign({}, preprocess, { filename })
        )
        .catch((error) =>
            expect(error.message).toMatch("modular-css-svelte supports <style> OR <link>, but not both")
        );
    });
});
