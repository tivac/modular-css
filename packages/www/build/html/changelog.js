"use strict";

const fs = require("fs");
const path = require("path");

const get = require("import-fresh");
const { default : toc } = require("markdown-it-toc-and-anchor");

const { dest } = require("../environment.js");
const css = require("./css.js");

module.exports = ({ graph, bundle }) => {
    const md = require("./markdown.js")();
    
    // Set up markdown plugins
    md.use(toc, {
        tocFirstLevel   : 2,
        tocLastLevel    : 2,
        tocClassName    : "toc",
        anchorClassName : "anchor",
    });

    const entry = "changelog.cjs.js";
    const file = path.join(dest, "./changelog/index.html");

    const changelog = fs.readFileSync(
        require.resolve("../../../../CHANGELOG.md"),
        "utf8"
    );

    const Changelog = get(path.join(dest, entry));

    // Write out guide page
    return {
        file,
        html : Changelog.render({
            content : md.render(changelog),
            styles  : css(entry, {
                graph,
                bundle,
                file,
            }),
        })
    };
};
