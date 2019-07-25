"use strict";

const path = require("path");

const markdown = require("markdown-it");
const { default : toc } = require("markdown-it-toc-and-anchor");
const includer = require("markdown-it-include");
const container = require("markdown-it-container");
const prism = require("markdown-it-prism");

const { createFilter } = require("rollup-pluginutils");

const replRenderer = require("./repl-renderer.js");

module.exports = ({ include = "**/*.md", exclude } = false) => {
    const filter = createFilter(include, exclude, { resolve : false });

    return {
        name : "rollup-plugin-md",

        transform(code, id) {
            if(!filter(id)) {
                return;
            }
            
            const { dir } = path.parse(id);

            const md = markdown({
                html        : true,
                linkify     : true,
                typographer : true,
            });
            
            // Prism highlighting for codeblocks
            md.use(prism);
    
            // TOC support
            md.use(toc, {
                tocFirstLevel   : 2,
                tocLastLevel    : 3,
                tocClassName    : "toc",
                anchorClassName : "anchor",
            });

            // Including other MD files inline
            md.use(includer, dir);

            // Custom containers
            md.use(container, "repl", {
                render : replRenderer,
            });

            // Have to render ahead-of-time so TOCs can be mapped for sidebar
            let tocs;

            const html = md.render(code, {
                tocCallback : (tocmd, headings, tochtml) => {
                    tocs = tochtml;
                },
            });

            // Can't use dedent for this or rollup freaks out & ignores it? Weird.
            // eslint-disable-next-line consistent-return
            return `
                const tocs = ${JSON.stringify(tocs)};
                const content = ${JSON.stringify(html)};
                
                export {
                    tocs,
                    content,
                };
            `;
        },
    };
};
