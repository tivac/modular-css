"use strict";

const fs = require("fs");
const path = require("path");

const template = fs.readFileSync(path.join(__dirname, "./rollup-plugin-html.html"), "utf8");

module.exports = () => {
    let html;
    let dir;

    return {
        name : "rollup-plugin-html",
        
        generateBundle(options, chunks, isWrite) {
            if(!isWrite) {
                return;
            }

            const styles = [];
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

            html = template
                .replace(
                    "<!-- STYLES -->",
                    styles.map((style) =>
                        `<link rel="stylesheet" href="${style}" />`
                    ).join("\n")
                )
                .replace(
                    "/* SCRIPTS */",
                    scripts.map((script) =>
                        `shimport("./${script}");`
                    ).join("\n")
                );
        },
        
        writeBundle : () =>
            fs.writeFileSync(
                path.join(dir, "./index.html"),
                html,
                "utf8"
            ),
    };
};
