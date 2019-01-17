"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");
const md = require("markdown-it")({
    html        : true,
    linkify     : true,
    typographer : true,
});

const prism = require("markdown-it-prism");
const { default : toc } = require("markdown-it-toc-and-anchor");

const svelte = require("./svelte.js");
const { version } = require("../package.json");

const type = "md";

const prismTheme = "https://unpkg.com/prismjs@1.15.0/themes/prism-tomorrow.css";

module.exports = ({ preprocess }) => {
    const outputs = new Map();
    let guides;
    const tocs = [];

    // Set up markdown plugins
    md.use(toc, {
        tocFirstLevel   : 3,
        tocClassName    : "toc",
        anchorClassName : "anchor",
    });

    md.use(prism);

    return {
        name : "rollup-plugin-generate-html",

        async buildStart() {
            guides = shell.find(path.resolve(__dirname, `../src/guide/*.md`));

            // Watch guide markdown files for changes
            guides.forEach((guide) => this.addWatchFile(guide));

            // Also watch home page markdown
            this.addWatchFile(require.resolve("../src/index.md"));
        },

        async generateBundle({ dir }, chunks) {
            const page = await svelte({ file : require.resolve("../src/page.html") });
            const layout = await svelte({
                file : require.resolve("../src/layout.html"),
                preprocess,
            });


            const styles = [];
            const scripts = [];
            
            // Figure out REPL requirements
            Object.entries(chunks).forEach(([ file, { isAsset, isEntry }]) => {
                if(isAsset && path.extname(file) === ".css") {
                    return styles.push(`../${file}`);
                }

                if(isEntry) {
                    return scripts.push(file);
                }
            });

            outputs.set(
                path.join(dir, "./repl/index.html"),
                page.render({
                    title : "REPL",
                    
                    // TODO: Remove this somehow, the lazy-loading in
                    // codemirror.js breaks codemirror for some reason
                    styles : styles.concat([
                        "https://unpkg.com/codemirror@5.24.2/lib/codemirror.css",
                        "https://unpkg.com/codemirror@5.24.2/theme/monokai.css",
                    ]),
                    
                    scripts : `
                    <script>
                    function shimport(src) {
                        try {
                            new Function('import("' + src + '")')();
                        } catch (e) {
                            var s = document.createElement('script');
                            s.src = 'https://unpkg.com/shimport';
                            s.dataset.main = src;
                            document.head.appendChild(s);
                        }
                    }
            
                    ${scripts.map((script) => `shimport("../${script}");`).join("\n")}
                    </script>`,
                })
            );

            const html = guides
                .map((file) => {
                    let text = fs.readFileSync(file, "utf8");
                
                    // Prefix headers to decrement them all down a level
                    text = text.replace(/^#/gm, "##");
                    
                    return md.render(text, {
                        tocCallback : (tocmd, headings, tochtml) =>
                            tocs.push(
                                `<li class="doc"><a href="#${headings[0].anchor}">${headings[0].content}</a></li>`,
                                tochtml
                            )
                    });
                })
                .join("\n");

            // Write out guide page
            outputs.set(
                path.join(dir, "./guide/index.html"),
                page.render({
                    title  : "Guide",
                    styles : styles.concat([
                        prismTheme,
                    ]),
                    content : layout.render({
                        version,
                        type    : "guide",
                        content : html,
                        sidebar : tocs.join("\n"),
                    }),
                })
            );

            // Write out home page
            outputs.set(
                path.join(dir, "./index.html"),
                page.render({
                    styles : styles.concat([
                        prismTheme,
                    ]),
                    content : layout.render({
                        version,
                        type    : "home",
                        content : md.render(
                            fs.readFileSync(require.resolve("../src/index.md"), "utf8")
                        ),
                    }),
                }),
            );
        },
        
        writeBundle() {
            outputs.forEach((html, file) => {
                const dir = path.dirname(file);

                shell.mkdir("-p", dir);

                fs.writeFileSync(file, html, "utf8");
            });
        },
    };
};
