"use strict";

const escape = require("escape-string-regexp");
const isUrl = require("is-url");

const { replaceTrailingNewlines } = require("./replacer.js");

const linkRegex = /<link\b[^<>]*?\bhref=\s*(?:"([^"]+)"|'([^']+)'|([^>\s]+))[^>]*>/gm;
const scriptRegex = /<script[\S\s]*?>([\S\s]*?)<\/script>/im;

// eslint-disable-next-line max-statements
exports.extractLink = async ({
    source,
    file,
    filename,
    processor,
    log,
    filter,
    missing,
    warn,
}) => {
    linkRegex.lastIndex = 0;
    
    const links = source.match(linkRegex);

    if(!links) {
        return false;
    }
    
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

    const external = processor.resolve(filename, href);

    log("extract <link>", external);

    if(processor.has(external)) {
        processor.invalidate(external);
    }

    let result;

    try {
        // Process the file
        result = await processor.file(external);
    } catch(e) {
        e.message = e.toString();

        throw e;
    }

    // Remove the <link> element from the component to avoid double-loading
    source = replaceTrailingNewlines(source, link);

    // Inject the linked CSS into the <script> block for JS referencing
    // and so rollup will know about the file
    const script = source.match(scriptRegex);
    const inject = `import css from ${JSON.stringify(href)};`;

    if(script) {
        const [ tag, contents ] = script;

        source = source.replace(
            tag,
            tag.replace(contents, `\n${inject}\n\n${contents}`)
        );
    } else {
        source += `<script>${inject}</script>`;
    }

    return {
        source,
        result,
        css          : href,
        dependencies : [ ...processor.fileDependencies(external), external ],
    };
};
