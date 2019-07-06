"use strict";

const fs = require("fs");
const path = require("path");

const get = require("import-fresh");
const { default : toc } = require("markdown-it-toc-and-anchor");
const include = require("markdown-it-include");

const { src, dest } = require("../environment.js");
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

    md.use(include, path.join(src, "./api"));

    const entry = "api.cjs.js";
    const file = path.join(dest, "./api/index.html");
    let tocs;

    // Have to render ahead-of-time so TOCs can be mapped for sidebar
    const html = md.render(fs.readFileSync(path.join(src, "./api/api.md"), "utf8"), {
        tocCallback : (tocmd, headings, tochtml) => {
            tocs = tochtml;
        },
    });

    const api = get(path.join(dest, entry));

    // Write out api page
    return {
        file,
        html : api.render({
            tocs,
            content : html,
            styles  : css(entry, {
                graph,
                bundle,
                file,
                styles : [
                    "prism",
                ],
        }),
        }),
    };
};
