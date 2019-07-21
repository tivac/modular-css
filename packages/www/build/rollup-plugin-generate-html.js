"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const { dest } = require("./environment.js");

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
                // TODO: find repl output file from previous build
                // TODO: set that file as data.js to trigger loading

                // TODO: this is failing but... shouldn't be?
                // const [ js ] = Object.values(previous())
                //     .find(([ , { isAsset, name : mod }]) => !isAsset && mod === "repl");
                
                // data.js = js;
            }

            const { html } = page.render(data);

            shell.mkdir("-p", dir);

            fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
        });
    },
});
