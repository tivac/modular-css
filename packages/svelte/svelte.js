"use strict";

const path = require("path");

const isUrl = require("is-url");
const escape = require("escape-string-regexp");
const slash = require("slash");
const utils = require("@rollup/pluginutils");

const Processor = require("@modular-css/processor");

const replacer = require("./replacer.js");

const styleRegex = /<style[^>]*?type=['"]text\/m-css['"][^>]*?>([\S\s]+?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const missedRegex = /css\.\w+/gim;
const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/gm;

const prefix = `[${require("./package.json").name}]`;

const CONFIG_DEFAULTS = {
    verbose : false,
    values  : false,

    // Regexp to work around https://github.com/rollup/rollup-pluginutils/issues/39
    include : /\.css$/i,
};

module.exports = (opts = {}) => {
    const options = {
        __proto__ : null,
        ...CONFIG_DEFAULTS,
        ...opts,
    };

    // Use a passed processor, or set up our own if necessary
    const { processor = new Processor(options) } = options;

    const { cwd } = processor.options;

    // eslint-disable-next-line no-console, no-empty-function
    const log = options.verbose ? console.log.bind(console, prefix) : () => {};

    // eslint-disable-next-line no-console
    const warn = console.warn.bind(console, prefix, "WARN");

    const relative = (file) => slash(path.relative(cwd, file));

    const filter = utils.createFilter(options.include, options.exclude);

    // Check for and stringify any values in the template we couldn't convert
    const missing = ({ source, file }) => {
        missedRegex.lastIndex = 0;

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
            new RegExp(`(\\b)(${missed.map((ref) => escape(ref)).join("|")})(\\b)`, "g"),
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

        linkRegex.lastIndex = 0;
        styleRegex.lastIndex = 0;

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

            source = source.replace(style[0], "");

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

                if(!filter(href)) {
                    // eslint-disable-next-line no-console
                    console.warn(`Possible invalid <link> href: ${href}`);
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

            dependencies = [ ...processor.fileDependencies(external), external ];
        }

        log("processed styles", file);

        const { exports : exported, details } = result;
        const { values } = details;
        const classKeys = Object.keys(exported);
        const valueKeys = Object.keys(values);

        if(classKeys.length) {
            log("updating source {css.<key>} references from", css);
            log(JSON.stringify(classKeys));
            
            const selectors = [ ...classKeys, ...valueKeys ].map(escape).join("|");

            // Look for instances of class={css.foo} to warn about
            const matches = source.match(new RegExp(`class={css\\.(?:${selectors})}`, "g"));

            if(matches) {
                for(const match of matches) {
                    warn(`Unquoted class attribute! ${match}`, file);
                }
            }

            // Replace css.<key> values
            source = replacer(source, {
                identifier : "css",
                keys       : classKeys,
                lookup     : classKeys.reduce((acc, curr) => {
                    acc[curr] = exported[curr].join(" ");

                    return acc;
                }, Object.create(null)),
            });
        }
        
        if(options.values && valueKeys.length) {
            log("updating source {cssvalue.<key>} references from", css);
            log(JSON.stringify(valueKeys));

            source = replacer(source, {
                identifier : "cssvalue",
                keys       : valueKeys,
                lookup     : valueKeys.reduce((acc, curr) => {
                    acc[curr] = values[curr].value;

                    return acc;
                }, Object.create(null)),
            });
        }

        return {
            code : missing({
                source,
                file : css,
            }),
            dependencies,
        };
    };

    return {
        processor,
        preprocess : {
            markup,
        },
    };
};

