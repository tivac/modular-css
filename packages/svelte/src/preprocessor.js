"use strict";

const path = require("path");

const resolve = require("resolve-from");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/im;
const missedRegex = /css\.\w+/gim;

class Preprocessor {
    constructor(args = false) {
        const processor = new Processor(args);

        this.processor = processor;
        this.config = args;

        // eslint-disable-next-line no-console, no-empty-function
        this.log = args.verbose ? console.log.bind(console, "[svelte]") : () => {};

        const { markup, style } = this;

        // Expose svelte preprocessor API
        this.preprocess = {
            markup : markup.bind(this),
            style  : style.bind(this),
        };
    }

    markup({ content, filename }) {
        this.source = content;
        this.filename = filename;

        const link = content.match(linkRegex);
        const style = content.match(styleRegex);

        if(link && style) {
            throw new Error("@modular-css/svelte: use <style> OR <link>, but not both");
        }

        if(style) {
            return this.extractStyle({ style });
        }

        if(link) {
            return this.extractLink({ link });
        }

        // No-op, return the source
        return {
            code : content,
        };
    }

    // Style elements are always stripped out
    style() {
        return {
            code : "/* replaced by modular-css */",
        };
    }

    updateCss({ result, filename }) {
        const { log, processor, source } = this;

        const exported = result.files[result.file].exports;
        const keys = Object.keys(exported);
        let code = source;

        log("updating css references", filename, JSON.stringify(keys));

        if(keys.length) {
            const selectors = keys.join("|");

            code = code
                // Replace simple {css.<key>} values first
                .replace(
                    new RegExp(`{css\\.(${selectors})}`, "gm"),
                    (match, key) => exported[key].join(" ")
                )
                // Then any remaining bare css.<key> values
                .replace(
                    new RegExp(`(\\b)css\\.(${selectors})(\\b)`, "gm"),
                    (match, prefix, key, suffix) => `${prefix}"${exported[key].join(" ")}"${suffix}`
                );
        }

        // Check for any values in the template we couldn't convert
        const missed = code.match(missedRegex);

        if(missed) {
            const { strict } = processor.options;

            const classes = missed.map((reference) => reference.split("css.")[1]);

            if(strict) {
                throw new Error(`@modular-css/svelte: Unable to find .${classes.join(", .")} in "${filename}"`);
            }

            classes.forEach((key) =>
                // eslint-disable-next-line no-console
                console.warn(`@modular-css/svelte: Unable to find .${key} in "${filename}"`)
            );
        }

        return {
            code,
        };
    }

    async extractLink({ link }) {
        const { config, filename, log, processor, source } = this;

        // This looks weird, but it's to support multiple types of quotation marks
        const href = link[1] || link[2] || link[3];

        const external = resolve(path.dirname(filename), href);

        log("extract <link>", filename, external);

        if(config.clean) {
            // Remove any files that've already been encountered, they should be re-processed
            if(external in processor.files) {
                [ ...processor.dependents(external), external ].forEach((file) => processor.remove(file));
            }
        }

        // Remove the <link> element from the component to avoid double-loading
        let markup = source.replace(link[0], "");

        const script = source.match(scriptRegex);

        // To get rollup to watch the CSS file we need to inject an import statement
        // if a <script> block already exists hijack it otherwise inject a simple one
        if(script) {
            const [ tag, contents ] = script;

            markup = markup.replace(
                tag,
                tag.replace(contents, dedent(`
                    import css from ${JSON.stringify(href)};
                    ${contents}
                `))
            );
        } else {
            markup += dedent(`
                <script>
                    import css from ${JSON.stringify(href)};
                </script>
            `);
        }

        this.source = markup;

        const result = await processor.file(external);

        return this.updateCss({
            result,
            filename : href,
        });
    }

    async extractStyle({ style }) {
        const { log, filename, processor } = this;
        
        log("extract <style>", filename);

        const result = await processor.string(
            filename,
            style[1]
        );

        return this.updateCss({
            result,
            filename : "<style>",
        });
    }
}

module.exports = Preprocessor;
