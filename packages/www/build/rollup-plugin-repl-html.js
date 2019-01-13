"use strict";

const fs = require("fs");
const path = require("path");

const svelte = require("./svelte.js");

module.exports = () => {
    let html;
    let dir;
    let page;

    return {
        name : "rollup-plugin-repl-html",
        
        async buildStart() {
            if(page) {
                return;
            }
            
            page = await svelte({ file : require.resolve("../src/page.html") });
        },
        
        generateBundle(options, chunks) {
            const styles = [
                "https://unpkg.com/codemirror@5.24.2/lib/codemirror.css",
                "https://unpkg.com/codemirror@5.24.2/theme/monokai.css",
            ];
            
            const scripts = [];
            
            dir = options.dir;

            Object.entries(chunks).forEach(([ file, { isAsset, isEntry }]) => {
                if(isAsset && path.extname(file) === ".css") {
                    return styles.push(file);
                }

                if(isEntry) {
                    return scripts.push(file);
                }
            });

            html = page.render({
                title : "REPL",

                styles,
                
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
        
                ${scripts.map((script) => `shimport("./${script}");`).join("\n")}
                </script>`,
            });
        },
        
        writeBundle() {
            fs.writeFileSync(
                path.join(dir, "./index.html"),
                html,
                "utf8"
            );
        },
    };
};
