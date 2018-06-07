"use strict";

const path = require("path");

const resolve = require("resolve-from");
const dedent = require("dedent");
const slash = require("slash");

const styleRegex = /<style[\S\s]*?>([\S\s]*?)<\/style>/igm;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/igm;
const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/igm;

/* eslint-disable max-statements */
module.exports = (processor) => ({ content, filename }) => {
    const link = linkRegex.exec(content);
    const style = styleRegex.exec(content);

    if(!link && !style) {
        return {
            code : content
        };
    }

    if(link && style) {
        throw new Error("modular-css-svelte supports <style> OR <link>, but not both");
    }

    let css;

    if(style) {
        css = processor.string(
            filename,
            style[1]
        );
    }

    if(link) {
        // Remove the <link> element from the component to avoid double-loading
        content = content.replace(link[0], "");

        let external = slash(resolve(path.dirname(filename), link[1] || link[2] || link[3]));

        css = processor.file(external);

        const script = scriptRegex.exec(content);
        
        // To get rollup to watch the CSS file we need to inject an import statement
        // if a <script> block already exists hijack it
        // otherwise inject a simple one
        if(script) {
            content = content.replace(
                script[0],
                script[0].replace(script[1], dedent(`
                    import ${JSON.stringify(external)};
                    ${script[1]}
                `))
            );
        } else {
            content += dedent(`
                <script>
                    import ${JSON.stringify(external)};
                </script>
            `);
        }
    }
    
    return css.then((result) => {
        const exported = result.files[result.file].exports;

        return {
            code : content
                // Replace simple {css.<key>} values first
                .replace(
                    new RegExp(`{css.(${Object.keys(exported).join("|")})}`, "gm"),
                    (match, key) => exported[key].join(" ")
                )
                // Then any remaining bare css.<key> values
                .replace(
                    new RegExp(`(\\b)css.(${Object.keys(exported).join("|")})(\\b)`, "gm"),
                    (match, prefix, key, suffix) => `${prefix}"${exported[key].join(" ")}"${suffix}`
                )
        };
    });
};
