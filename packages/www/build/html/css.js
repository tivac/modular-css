"use strict";

const path = require("path");

const isUrl = require("is-url");

const { dest } = require("../environment.js");

const aliases = new Map([
    [ "prism", "https://unpkg.com/prismjs@1.15.0/themes/prism-tomorrow.css" ],
]);

module.exports = (entry, { file, graph, bundle, styles = [] }) => {
    const modules = [
        ...graph.dependenciesOf(entry),
        entry,
    ];

    const css = modules.reduce((out, key) => {
        const { assets = false } = bundle[key] || false;

        if(!assets) {
            return out;
        }

        out.push(...assets);

        return out;
    }, styles);

    const links = css.map((key) => {
        if(aliases.has(key)) {
            key = aliases.get(key);
        }
        
        const href = isUrl(key) ?
            key :
            path.relative(file, path.join(dest, key)).replace(/\\/g, "/");

        return `<link href="${href}" rel="stylesheet" />`;
    });

    return links;
};

