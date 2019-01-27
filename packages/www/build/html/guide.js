"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");
const { default : toc } = require("markdown-it-toc-and-anchor");

const { dest } = require("../environment.js");
const css = require("./css.js");

module.exports = ({ graph, bundle }) => {
    const md = require("./markdown.js")();
    
    // Set up markdown plugins
    md.use(toc, {
        tocFirstLevel   : 2,
        tocLastLevel    : 3,
        tocClassName    : "toc",
        anchorClassName : "anchor",
    });

    const entry = "guide.cjs.js";
    const file = path.join(dest, "./guide/index.html");
    let tocs;

    const markdown = shell
        .find(path.resolve(__dirname, `../../src/guide/*.md`))
        .map((doc) => fs.readFileSync(doc, "utf8"))
        .join("\n")
        // Prefix headers to decrement them all down a level
        .replace(/^#/gm, "##");
    
    fs.writeFileSync("./guides.md", markdown, "utf8");

    // Have to render ahead-of-time so TOCs can be mapped for sidebar
    const html = md.render(markdown, {
        tocCallback : (tocmd, headings, tochtml) => {
            tocs = tochtml;
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
