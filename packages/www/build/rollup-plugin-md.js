"use strict";

const path = require("path");

const markdown = require("markdown-it");
const anchor = require("markdown-it-anchor");
const contents = require("markdown-it-toc-done-right");
const includer = require("markdown-it-include");
const container = require("markdown-it-container");
const codemirror = require("codemirror/addon/runmode/runmode.node.js");

// Load up the various codemirror modes
require(`codemirror/mode/css/css.js`);
require(`codemirror/mode/javascript/javascript.js`);
require(`codemirror/mode/shell/shell.js`);
require(`codemirror/mode/htmlmixed/htmlmixed.js`);

const { createFilter } = require("rollup-pluginutils");

const replRenderer = require("./repl-renderer.js");
const mcssMime = require("./codemirror-mcss-mime.js");

mcssMime(codemirror);

// Mapping of markdown langs to codemirror langs
const MODE_MAP = new Map([
    [ "html", "htmlmixed" ],
    [ "css", "text/modular-css" ],
]);

module.exports = ({ include = "**/*.md", exclude } = false) => {
    const filter = createFilter(include, exclude, { resolve : false });

    return {
        name : "rollup-plugin-md",

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

                    if(MODE_MAP.has(lang)) {
                        lang = MODE_MAP.get(lang);
                    }

                    let html = "";

                    codemirror.runMode(code, lang, (token, style) => {
                        if(style) {
                            html += `<span class="cm-${style}">${md.utils.escapeHtml(token)}</span>`;
                        } else {
                            html += md.utils.escapeHtml(token);
                        }
                    });

                    return `<pre class="code"><code><div class="CodeMirror cm-s-nord CodeMirror-wraphtml">${html}</div></code></pre>`;
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
