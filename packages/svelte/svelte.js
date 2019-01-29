"use strict";

const path = require("path");

const resolve = require("resolve-from");
const dedent = require("dedent");
const isUrl = require("is-url");
const escape = require("escape-string-regexp");

const Processor = require("@modular-css/processor");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const missedRegex = /css\.\w+/gim;

module.exports = (config = false) => {
    // Defined here to avoid .lastIndex bugs since /g is set
    const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/gim;

    // Use a passed processor, or set up our own if necessary
    const { processor = new Processor(config) } = config;

    // eslint-disable-next-line no-console, no-empty-function
    const log = config.verbose ? console.log.bind(console, "[svelte]") : () => {};

    // This function is hilariously large but it's actually simpler this way
    // Mostly because markup() is async so tracking state is painful w/o inlining
    // the whole damn thing
    // eslint-disable-next-line max-statements, complexity
    const markup = async ({ content, filename }) => {
        let source = content;

        const links = source.match(linkRegex);
        const style = source.match(styleRegex);

        if(links && style) {
            throw new Error("@modular-css/svelte: use <style> OR <link>, but not both");
        }

        // No-op
        if(!links && !style) {
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
            
            if(processor.has(filename)) {
                processor.invalidate(filename);
            }
    
            result = await processor.string(
                filename,
                style[1]
            );
        }

        if(links) {
            const valid = links.reduce((out, link) => {
                linkRegex.lastIndex = 0;

                const parts = linkRegex.exec(link);

                // This looks weird, but it's to support multiple types of quotation marks
                const href = parts[1] || parts[2] || parts[3];

                // Don't transform URLs
                if(isUrl(href)) {
                    return out;
                }

                out.push({
                    link,
                    href,
                });

                return out;
            }, []);

            // No-op
            if(!valid.length) {
                return {
                    code : source,
                };
            }

            if(valid.length > 1) {
                // eslint-disable-next-line no-console
                console.warn("@modular-css/svelte will only use the first local <link> tag");
            }

            const [{ link, href }] = valid;

            // Assign to file for later usage in logging
            file = href;

            const external = resolve(path.dirname(filename), file);

            log("extract <link>", external);

            if(processor.has(external)) {
                processor.invalidate(external);
            }

            // Process the file
            result = await processor.file(external);

            // Remove the <link> element from the component to avoid double-loading
            source = source.replace(new RegExp(`${escape(link)}\r?\n?`), "");

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
                // Replace {css.<key>} values
                // Note extra exclusion to avoid accidentally matching ${css.<key>}
                .replace(
                    new RegExp(`([^$]){css\\.(${selectors})}`, "gm"),
                    (match, prefix, key) => {
                        const replacement = Array.isArray(exported[key]) ? exported[key].join(" ") : exported[key];

                        return `${prefix}${replacement}`;
                    }
                )

                // Then any remaining css.<key> values
                .replace(
                    new RegExp(`(\\b)css\\.(${selectors})(\\b)`, "gm"),
                    (match, prefix, key, suffix) => {
                        const replacement = Array.isArray(exported[key]) ? exported[key].join(" ") : exported[key];
                        
                        return `${prefix}"${replacement}"${suffix}`;
                    }
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

