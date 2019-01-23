"use strict";

const fs = require("fs");
const path = require("path");

const dedent = require("dedent");
const shell = require("shelljs");
const md = require("markdown-it")({
    html        : true,
    linkify     : true,
    typographer : true,
});

const prism = require("markdown-it-prism");
const { default : toc } = require("markdown-it-toc-and-anchor");

const { dest } = require("./environment.js");

const repl = require("./html/repl.js");
const guide = require("./html/guide.js");
const home = require("./html/home.js");

module.exports = () => {
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
            // Watch markdown files for changes
            shell
                .find(path.resolve(__dirname, `../src/**/*.md`))
                .forEach((doc) => this.addWatchFile(doc));
        },

        async writeBundle() {
            const outputs = [
                repl({ md }),
                guide({ md }),
                home({ md }),
            ];
            
            outputs.forEach(({ file, html }) => {
                const dir = path.dirname(file);

                shell.mkdir("-p", dir);

                fs.writeFileSync(file, html, "utf8");
            });
        },
    };
};
