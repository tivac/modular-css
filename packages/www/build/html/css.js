"use strict";

const path = require("path");

const isUrl = require("is-url");

const { dest } = require("../environment.js");

module.exports = (entry, { file, graph, bundle, styles = [] }) => {
    const modules = [
        ...graph.dependenciesOf(entry),
        entry,
    ];

    return modules.reduce((out, key) => {
        const { assets = false } = bundle[key] || false;

        if(!assets) {
            return out;
        }

        out.push(...assets);

        return out;
    }, styles)
    .map((css) => {
        const href = isUrl(css) ? css : path.relative(file, path.join(dest, css)).replace(/\\/g, "/");

        return `<link href="${href}" rel="stylesheet" />`;
    });
};

