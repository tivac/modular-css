"use strict";

const path = require("path");

const resolve = require("resolve-from");
const dedent = require("dedent");
const slash = require("slash");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/im;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;
const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/im;

function updateCss({ content, result }) {
    const exported = result.files[result.file].exports;

    return {
        code : content
            // Replace simple {css.<key>} values first
            .replace(
                new RegExp(`{css\\.(${Object.keys(exported).join("|")})}`, "gm"),
                (match, key) => exported[key].join(" ")
            )
            // Then any remaining bare css.<key> values
            .replace(
                new RegExp(`(\\b)css\\.(${Object.keys(exported).join("|")})(\\b)`, "gm"),
                (match, prefix, key, suffix) => `${prefix}"${exported[key].join(" ")}"${suffix}`
            )
    };
}

async function extractLink({ processor, content, filename, link }) {
    let href = link[1] || link[2] || link[3];
    
    let external = slash(resolve(path.dirname(filename), href));

    // Remove the <link> element from the component to avoid double-loading
    content = content.replace(link[0], "");

    const script = content.match(scriptRegex);

    // To get rollup to watch the CSS file we need to inject an import statement
    // if a <script> block already exists hijack it otherwise inject a simple one
    if(script) {
        content = content.replace(
            script[0],
            script[0].replace(script[1], dedent(`
                import css from ${JSON.stringify(href)};
                ${script[1]}
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

    return updateCss({ content, result });
}

async function extractStyle({ processor, content, filename, style }) {
    const result = await processor.string(
        filename,
        style[1]
    );

    return updateCss({ content, result });
}

/* eslint-disable max-statements */
module.exports = (processor) => ({ content, filename }) => {
    const link = content.match(linkRegex);
    const style = content.match(styleRegex);

    if(link && style) {
        throw new Error("modular-css-svelte supports <style> OR <link>, but not both");
    }

    if(style) {
        return extractStyle({
            processor,
            content,
            filename,
            style,
        });
    }

    if(link) {
        return extractLink({
            processor,
            content,
            filename,
            link,
        });
    }

    return {
        code : content
    };
};
