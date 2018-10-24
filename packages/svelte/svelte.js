"use strict";

const path = require("path");

const resolve = require("resolve-from");
const dedent = require("dedent");

const Processor = require("@modular-css/processor");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/im;
const missedRegex = /css\.\w+/gim;

module.exports = (config = false) => {
    const processor = new Processor(config);

    // eslint-disable-next-line no-console, no-empty-function
    const log = config.verbose ? console.log.bind(console, "[svelte]") : () => {};

    // This function is hilariously large but it's actually simpler this way
    // Mostly because markup() is async so tracking state is painful w/o inlining
    // the whole damn thing
    // eslint-disable-next-line max-statements
    const markup = async ({ content, filename }) => {
        let source = content;

        const link = source.match(linkRegex);
        const style = source.match(styleRegex);

        if(link && style) {
            throw new Error("@modular-css/svelte: use <style> OR <link>, but not both");
        }

        // No-op
        if(!link && !style) {
            return {
                code : source,
            };
        }

        let result;
        let file;

        log("Processing", filename);

        if(style) {
            log("extract <style>");

            file = "<style>";

            result = await processor.string(
                filename,
                style[1]
            );
        }

        if(link) {
            // This looks weird, but it's to support multiple types of quotation marks
            file = link[1] || link[2] || link[3];

            const external = resolve(path.dirname(filename), file);

            log("extract <link>", external);

            // When cleaning remove any files that've already been encountered, they need to be re-processed
            if(config.clean) {
                if(external in processor.files) {
                    [ ...processor.dependents(external), external ].forEach((entry) => processor.remove(entry));
                }
            }

            // Process the file
            result = await processor.file(external);

            // Remove the <link> element from the component to avoid double-loading
            source = source.replace(link[0], "");

            // To get rollup to watch the CSS file we need to inject an import statement
            // if a <script> block already exists hijack it otherwise inject a simple one
            const script = source.match(scriptRegex);

            if(script) {
                const [ tag, contents ] = script;

                source = source.replace(
                    tag,
                    tag.replace(contents, `\nimport css from ${JSON.stringify(file)};\n\n${contents}`)
                );
            } else {
                source += dedent(`
                    <script>
                        import css from ${JSON.stringify(file)};
                    </script>
                `);
            }
        }

        const exported = result.exports;
        const keys = Object.keys(exported);

        log("updating source {css.<key>} references from", file);
        log(JSON.stringify(keys));

        if(keys.length) {
            const selectors = keys.join("|");

            source = source
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
        const missed = source.match(missedRegex);

        if(missed) {
            const { strict } = processor.options;

            const classes = missed.map((reference) => reference.split("css.")[1]);

            if(strict) {
                throw new Error(`@modular-css/svelte: Unable to find .${classes.join(", .")} in "${file}"`);
            }

            classes.forEach((key) =>
                // eslint-disable-next-line no-console
                console.warn(`@modular-css/svelte: Unable to find .${key} in "${file}"`)
            );
        }

        return {
            code : source,
        };
    };

    return {
        processor,
        preprocess : {
            markup,

            // Style elements are always stripped out completely
            style : () => ({
                code : "/* replaced by modular-css */",
            }),
        },
    };
};

