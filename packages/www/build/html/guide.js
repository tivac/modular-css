"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const { dest } = require("../environment.js");

const css = require("./css.js");

module.exports = ({ md, graph, bundle }) => {
    const entry = "guide.cjs.js";
    const file = path.join(dest, "./guide/index.html");
    const tocs = new Map();

    const markdown = shell
        .find(path.resolve(__dirname, `../../src/guide/*.md`))
        .map((file) => fs.readFileSync(file, "utf8"))
        .join("\n")
        // Prefix headers to decrement them all down a level
        .replace(/^#/gm, "##");

    // Have to render ahead-of-time so TOCs can be mapped for sidebar
    const html = md.render(markdown, {
        tocCallback : (tocmd, headings, tochtml) => {
            const [{ anchor, content }] = headings;

            tocs.set({
                anchor,
                content,
            }, tochtml);
        },
    });

    const Guide = require(path.join(dest, entry));

    // Write out guide page
    return {
        file,
        html : Guide.render({
            tocs,
            content : html,
            styles  : css(entry, {
                graph,
                bundle,
                file,
                styles : [
                    "https://unpkg.com/prismjs@1.15.0/themes/prism-tomorrow.css",
                ]
        }),
        })
    };
};
