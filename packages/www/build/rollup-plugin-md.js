"use strict";

const path = require("path");

const { default : toc } = require("markdown-it-toc-and-anchor");
const includer = require("markdown-it-include");

const { createFilter } = require("rollup-pluginutils");

module.exports = ({ include = "**/*.md", exclude } = false) => {
    const filter = createFilter(include, exclude, { resolve : false });

    return {
        name : "rollup-plugin-md",

        transform(code, id) {
            if(!filter(id)) {
                return;
            }

            const md = require("./html/markdown.js")();
            const parts = path.parse(id);
    
            // Set up markdown plugins
            md.use(toc, {
                tocFirstLevel   : 2,
                tocLastLevel    : 3,
                tocClassName    : "toc",
                anchorClassName : "anchor",
            });

            md.use(includer, parts.dir);

            let tocs;

            // Have to render ahead-of-time so TOCs can be mapped for sidebar
            const html = md.render(code, {
                tocCallback : (tocmd, headings, tochtml) => {
                    tocs = tochtml;
                },
            });
            
            // eslint-disable-next-line
            return `
            const tocs = ${JSON.stringify(tocs)};
            const content = ${JSON.stringify(html)};
            
            export {
                tocs,
                content,
            };`;
        },
    };
};
