"use strict";

const path = require("path");

const isUrl = require("is-url");
const escape = require("escape-string-regexp");
const slash = require("slash");

const Processor = require("@modular-css/processor");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const missedRegex = /css\.\w+/gim;

const prefix = `[${require("./package.json").name}]`;

module.exports = (config = false) => {
    // Defined here to avoid .lastIndex bugs since /g is set
    const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/gim;

    // Use a passed processor, or set up our own if necessary
    const { processor = new Processor(config) } = config;

    const { cwd, verbose, warnOnUnused } = processor.options;

    // eslint-disable-next-line no-console, no-empty-function
    const log = verbose ? console.log.bind(console, prefix) : () => {};

    // eslint-disable-next-line no-console
    const warn = console.warn.bind(console, prefix, "WARN");

    const relative = (file) => slash(path.relative(cwd, file));

    // Check for and stringify any values in the template we couldn't convert
    const missing = ({ source, file, unused = false }) => {
        if(warnOnUnused && unused && unused.size) {
            unused.forEach((key) =>
                warn(`Unused CSS selector .${key} in ${file}`)
            );
        }
        
        const missed = source.match(missedRegex);

        if(!missed) {
            return source;
        }

        const { strict } = processor.options;

        const classes = missed.map((reference) => reference.replace("css.", ""));

        if(strict) {
            throw new Error(`${prefix} Unable to find .${classes.join(", .")} in "${file}"`);
        }

        classes.forEach((key) =>
            warn(`Unable to find .${key} in ${file}`)
        );

        // Turn all missing values into strings so nothing explodes
        return source.replace(
            new RegExp(`(${missed.map((ref) => escape(ref)).join("|")})`, "g"),
            (match) => JSON.stringify(match)
        );
    };

    // This function is hilariously large but it's actually simpler this way
    // Mostly because markup() is async so tracking state is painful w/o inlining
    // the whole damn thing
    // eslint-disable-next-line max-statements, complexity
    const markup = async ({ content, filename }) => {
        const file = filename ? relative(filename) : "Unknown file";

        let source = content;
        let dependencies = [];

        const links = source.match(linkRegex);
        const style = source.match(styleRegex);

        if(links && style) {
            throw new Error(`${prefix} Use <style> OR <link>, but not both in "${file}"`);
        }

        // No-op
        if(!links && !style) {
            return {
                code : missing({
                    source,
                    file : filename,
                }),
            };
        }

        let result;
        let css;

        log("Processing", file);

        if(style) {
            log("extract <style>", file);

            css = "<style>";

            if(processor.has(filename)) {
                processor.invalidate(filename);
            }

            try {
                result = await processor.string(
                    filename,
                    style[1]
                );
            } catch(e) {
                e.message = e.toString();

                throw e;
            }
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
                    code : missing({
                        source,
                        file : filename,
                    }),
                };
            }

            if(valid.length > 1) {
                warn(`Only the first local <link> tag will be used`, file);
            }

            const [{ link, href }] = valid;

            // Assign to file for later usage in logging
            css = href;

            const external = processor.resolve(filename, css);

            log("extract <link>", external);

            if(processor.has(external)) {
                processor.invalidate(external);
            }

            try {
                // Process the file
                result = await processor.file(external);
            } catch(e) {
                e.message = e.toString();

                throw e;
            }

            // Remove the <link> element from the component to avoid double-loading
            source = source.replace(new RegExp(`${escape(link)}(?:\r?\n)*`), "");

            // Inject the linked CSS into the <script> block for JS referencing
            // and so rollup will know about the file
            const script = source.match(scriptRegex);
            const inject = `import css from ${JSON.stringify(css)};`;

            if(script) {
                const [ tag, contents ] = script;

                source = source.replace(
                    tag,
                    tag.replace(contents, `\n${inject}\n\n${contents}`)
                );
            } else {
                source += `<script>${inject}</script>`;
            }

            dependencies = [ ...processor.dependencies(external), external ];
        }

        log("processed styles", file);

        const { exports : exported, details } = result;
        const { values } = details;
        
        const keys = Object.keys(exported);
        const unused = new Set(keys);

        // Don't check @values, it's not worth it
        Object.keys(values).forEach((value) => unused.delete(value));

        log("updating source {css.<key>} references from", css);
        log(JSON.stringify(keys));

        if(keys.length) {
            const selectors = keys.join("|");

            // Look for instances of class={css.foo} to warn about
            const matches = source.match(new RegExp(`class={css\.(?:${selectors})}`, "g"));

            if(matches) {
                for(const match of matches) {
                    warn(`Unquoted class attribute! ${match}`, file);
                }
            }

            const replacer = ({ sep = "", useSuffix = false } = false) =>
                (match, before, key, suffix = "") => {
                    let out;

                    if(key in values) {
                        out = exported[key];
                    } else {
                        out = exported[key].join(" ");
                        
                        exported[key].forEach((val) => unused.delete(val));
                    }

                    return `${before}${sep}${out}${sep}${useSuffix ? suffix : ""}`;
                };

            source = source
                // Replace {css.<key>} values
                // Note extra exclusion to avoid accidentally matching ${css.<key>}
                .replace(
                    new RegExp(`([^$]){css\\.(${selectors})}`, "gm"),
                    replacer()
                )

                // Then any remaining css.<key> values
                .replace(
                    new RegExp(`(\\b)css\\.(${selectors})(\\b)`, "gm"),
                    replacer({ sep : `"`, useSuffix : true })
                );
        }

        return {
            code : missing({
                source,
                unused,
                file : css,
            }),
            dependencies,
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

