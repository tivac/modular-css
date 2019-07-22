"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const { dest } = require("./environment.js");

const script = (src) => `
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

        shimport("/${src}");
    </script>
`;

module.exports = ({ bundle : previous }) => ({
    name : "rollup-plugin-generate-html",

    async writeBundle(bundle) {
        Object.entries(bundle).forEach(([ id, { isEntry, assets = [], imports = [] }]) => {
            if(!isEntry) {
                return;
            }

            const page = require(path.join(dest, id));
            const { name } = path.parse(id);
            let dir = path.join(dest, name);

            if(name === "home") {
                dir = dest;
            }

            const styles = [];

            imports.forEach((dep) => {
                const { assets : css = [] } = bundle[dep];
                
                css.forEach((href) => styles.push(`<link href="/${href}" rel="stylesheet" />`));
            });

            assets.forEach((href) => styles.push(`<link href="/${href}" rel="stylesheet" />`));

            const data = {
                styles,
            };

            // REPL has custom behavior because it was built in a previous pass, go find the
            // filename to use and set it on the component
            if(id === "repl.js") {
                // Using Object.entries because we need the key, but are comparing against the value,
                // it's weird-looking w/ all the destructuring
                const [ js, { assets : css = [] }] = Object.entries(previous()).find(([ , { isAsset, name : file }]) =>
                    !isAsset && file === "repl"
                );
                
                data.script = script(js);
                data.styles.push(...css);
            }

            const { html } = page.render(data);

            shell.mkdir("-p", dir);

            fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
        });
    },
});
