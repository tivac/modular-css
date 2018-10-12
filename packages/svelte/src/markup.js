"use strict";

const path = require("path");

const resolve = require("resolve-from");
const dedent = require("dedent");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/im;
const missedRegex = /css\.\w+/gim;

function updateCss({ processor, log, content, result, filename }) {
    const exported = result.files[result.file].exports;
    const keys = Object.keys(exported);
    let code = content;
    
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

async function extractLink({ processor, log, content, filename, link }) {
    // This looks weird, but it's to support multiple types of quotation marks
    const href = link[1] || link[2] || link[3];
    
    const external = resolve(path.dirname(filename), href);

    log("extract <link>", filename, external);

    // Remove any files that've already been encountered, they should be re-processed
    if(external in processor.files) {
        [ ...processor.dependents(external), external ].forEach((file) => processor.remove(file));
    }

    // Remove the <link> element from the component to avoid double-loading
    content = content.replace(link[0], "");

    const script = content.match(scriptRegex);

    // To get rollup to watch the CSS file we need to inject an import statement
    // if a <script> block already exists hijack it otherwise inject a simple one
    if(script) {
        const [ tag, contents ] = script;

        content = content.replace(
            tag,
            tag.replace(contents, dedent(`
                import css from ${JSON.stringify(href)};
                ${contents}
            `))
        );
    } else {
        content += dedent(`
            <script>
                import css from ${JSON.stringify(href)};
            </script>
        `);
    }

    const result = await processor.file(external);

    return updateCss({
        processor,
        log,
        content,
        result,
        filename : href,
    });
}

async function extractStyle({ processor, log, content, filename, style }) {
    log("extract <style>", filename);
    
    const result = await processor.string(
        filename,
        style[1]
    );

    return updateCss({
        processor,
        log,
        content,
        result,
        filename : "<style>",
    });
}

module.exports = (processor, config) => ({ content, filename }) => {
    const link = content.match(linkRegex);
    const style = content.match(styleRegex);

    // eslint-disable-next-line no-console, no-empty-function
    const log = config.verbose ? console.log.bind(console, "[svelte]") : () => {};

    if(link && style) {
        throw new Error("@modular-css/svelte: use <style> OR <link>, but not both");
    }

    if(style) {
        return extractStyle({
            processor,
            log,
            content,
            filename,
            style,
        });
    }

    if(link) {
        return extractLink({
            processor,
            log,
            content,
            filename,
            link,
        });
    }

    return {
        code : content,
    };
};
