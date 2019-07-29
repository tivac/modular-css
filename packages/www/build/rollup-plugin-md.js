"use strict";

const path = require("path");

const markdown = require("markdown-it");
const anchor = require("markdown-it-anchor");
const contents = require("markdown-it-toc-done-right");
const includer = require("markdown-it-include");
const container = require("markdown-it-container");
const shiki = require("shiki");

const { createFilter } = require("rollup-pluginutils");

const replRenderer = require("./repl-renderer.js");

module.exports = ({ include = "**/*.md", exclude } = false) => {
    const filter = createFilter(include, exclude, { resolve : false });

    let highlighter;

    return {
        name : "rollup-plugin-md",
        
        async buildStart() {
            if(highlighter) {
                return;
            }

            highlighter = await shiki.getHighlighter({ theme : "nord" });
        },

        async transform(src, id) {
            if(!filter(id)) {
                return;
            }
            
            const { dir } = path.parse(id);

            const md = markdown({
                html        : true,
                linkify     : true,
                typographer : true,
                highlight   : (code, lang) => {
                    if(!lang) {
                        return "";
                    }

                    return highlighter.codeToHtml(code, lang);
                },
            });

            let toc;
            
            // TOC support
            md.use(contents, {
                level          : [ 2, 3 ],
                listType       : "ul",
                containerClass : "toc",
                listClass      : "list",
                itemClass      : "item",
                linkClass      : "link",
                
                // Have to save out TOC HTML so it can be drawn for sidebar
                callback(html) {
                    toc = html;
                },
            });

            // Anchor support
            md.use(anchor, {
                level           : [ 2, 3 ],
                permalink       : true,
                permalinkBefore : true,
                permalinkSymbol : "🔗",
            });

            // Including other MD files inline
            md.use(includer, dir);

            // Custom containers
            md.use(container, "repl", {
                render : replRenderer,
            });

            const html = md.render(src);

            // Can't use dedent for this or rollup freaks out & ignores it? Weird.
            // eslint-disable-next-line consistent-return
            return `
                const tocs = ${JSON.stringify(toc)};
                const content = ${JSON.stringify(html)};
                
                export {
                    tocs,
                    content,
                };
            `;
        },
    };
};
