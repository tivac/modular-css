"use strict";

const fs = require("fs");
const path = require("path");

const template = `
<!DOCTYPE html>
<html>
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

    <!-- SCRIPTS -->
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
                    `<script src="${script}" type="module"></script>`
                ).join("\n")
            );
        
        fs.writeFileSync(path.resolve(__dirname, "../dist/index.html"), html, "utf8");
    },
});
