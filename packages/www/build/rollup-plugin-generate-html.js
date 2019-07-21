"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const { dest } = require("./environment.js");

module.exports = () => ({
    name : "rollup-plugin-generate-html",

    async writeBundle(bundle) {
        Object.entries(bundle).forEach(([ id, { isEntry, assets = [], imports = [] }]) => {
            if(!isEntry) {
                return;
            }

            console.log(id, { assets, imports });

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

            const { html } = page.render({ styles });

            shell.mkdir("-p", dir);

            fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
        });
    },
});
