"use strict";

const path = require("path");

const escape = require("escape-string-regexp");
const slash = require("slash");
const utils = require("@rollup/pluginutils");

const Processor = require("@modular-css/processor");

const { replacer } = require("./replacer.js");
const { extractStyle } = require("./style.js");
const { extractLink } = require("./link.js");
const { extractImport } = require("./script.js");

const missedRegex = /css\.\w+/gim;

const prefix = `[${require("./package.json").name}]`;

const CONFIG_DEFAULTS = {
    verbose : false,
    values  : false,

    // Regexp to work around https://github.com/rollup/rollup-pluginutils/issues/39
    include : /\.css$/i,
};

const PARSING_ORDER = [ extractStyle, extractLink, extractImport ];

module.exports = (opts = {}) => {
    const options = {
        __proto__ : null,
        ...CONFIG_DEFAULTS,
        ...opts,
    };

    // Use a passed processor, or set up our own if necessary
    const { processor = new Processor(options) } = options;

    const { cwd } = processor.options;

    // eslint-disable-next-line no-console, no-empty-function -- logging
    const log = options.verbose ? console.log.bind(console, prefix) : () => {};

    // eslint-disable-next-line no-console -- warning
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
    // eslint-disable-next-line max-statements -- just deal
    const markup = async ({ content, filename }) => {
        const file = filename ? relative(filename) : "Unknown file";

        let source = content;

        let result;
        let css;
        let dependencies;
        let ident;

        const searchBucket = {
            source,
            file,
            filename,
            processor,
            log,
            filter,
            missing,
            warn,
        };

        log("Processing", file);

        for(const parser of PARSING_ORDER) {
            try {
                // eslint-disable-next-line no-await-in-loop -- fine fine I got this
                ({ source, result, css, dependencies, ident = "css" } = await parser(searchBucket));
            } catch(e) {
                throw e;
            }

            if(result) {
                break;
            }
        }

        // No-op
        if(!result) {
            return {
                code : missing({
                    source : content,
                    file   : filename,
                }),
            };
        }

        log("processed styles", file);

        const { exports : exported, details } = result;
        const { values } = details;
        const classKeys = Object.keys(exported);
        const valueKeys = Object.keys(values);

        if(classKeys.length) {
            log("updating source {css.<key>} references from", css);
            log(JSON.stringify(classKeys));
            
            // Replace class={css.<key>} values
            source = replacer(source, {
                classAttr  : true,
                identifier : ident,
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

