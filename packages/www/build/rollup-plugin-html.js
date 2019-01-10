"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const template = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>modular-css</title>

        <link href="https://unpkg.com/normalize.css@8.0.1/normalize.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Inconsolata|Roboto" rel="stylesheet">
        <link href="https://unpkg.com/codemirror@5.24.2/lib/codemirror.css" rel="stylesheet" />
        <link href="https://unpkg.com/codemirror@5.24.2/theme/monokai.css" rel="stylesheet" />

        <!-- STYLES -->
    </head>
    <body>
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

    <!-- SCRIPTS -->
    </script>
    </body>
</html>
`;

module.exports = () => ({
    name : "rollup-plugin-html",
    
    generateBundle(options, chunks, isWrite) {
        if(!isWrite) {
            return;
        }

        const styles = [];
        const scripts = [];

        Object.entries(chunks).forEach(([ file, { isAsset, isEntry }]) => {
            if(isAsset && path.extname(file) === ".css") {
                return styles.push(file);
            }

            if(isEntry) {
                return scripts.push(file);
            }
        });

        const html = template
            .replace(
                "<!-- STYLES -->",
                styles.map((style) =>
                    `<link rel="stylesheet" href="${style}" />`
                ).join("\n")
            )
            .replace(
                "<!-- SCRIPTS -->",
                scripts.map((script) =>
                    `shimport("./${script}");`
                ).join("\n")
            );
        
        shell.mkdir("-p", path.resolve(__dirname, "../dist/repl/"));

        fs.writeFileSync(path.resolve(__dirname, "../dist/repl/index.html"), html, "utf8");
    },
});
