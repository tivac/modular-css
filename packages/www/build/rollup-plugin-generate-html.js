"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");
const MD = require("markdown-it");
const { default : toc } = require("markdown-it-toc-and-anchor");

const { dest } = require("./environment.js");
const svelte = require("./svelte.js");
const { version } = require("../package.json");

module.exports = ({ preprocess }) => {
    let page;
    let layout;

    const outputs = new Map();

    // Set up markdown renderer
    const md = new MD({
        html        : true,
        linkify     : true,
        typographer : true,
    });
    
    md.use(toc, {
        tocFirstLevel           : 3,
        wrapHeadingTextInAnchor : true,
    });

    return {
        name : "rollup-plugin-generate-html",

        async buildStart() {
            if(page || layout) {
                return;
            }
            
            page = await svelte({ file : require.resolve("../src/page.html") });
            layout = await svelte({
                file : require.resolve("../src/layout.html"),
                preprocess,
            });
        },
        
        generateBundle({ dir }, chunks) {
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
                    styles : styles.concat(
                        "https://unpkg.com/codemirror@5.24.2/lib/codemirror.css",
                        "https://unpkg.com/codemirror@5.24.2/theme/monokai.css",
                    ),
                    
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

            // Write out guide page
            const guides = shell
                .find(path.resolve(__dirname, `../src/guide/*.md`))
                .map((file) => {
                    let text = fs.readFileSync(file, "utf8");
                
                    // Prefix headers to decrement them all down a level
                    text = text.replace(/^#/gm, "##");
                    
                    return md.render(text);
                });
        
            outputs.set(
                path.join(dir, "./guide/index.html"),
                page.render({
                    styles,
                    title   : "Guide",
                    content : layout.render({
                        content : guides.join("\n"),
                        version,
                    }),
                })
            );


            // Write out home page
            outputs.set(
                path.join(dir, "./index.html"),
                page.render({
                    styles,
                    content : layout.render({
                        content : md.render(
                            fs.readFileSync(require.resolve("../src/index.md"), "utf8")
                        ),
                        version,
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
