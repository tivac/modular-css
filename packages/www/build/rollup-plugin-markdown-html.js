"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");
const MD = require("markdown-it");
const { default : toc } = require("markdown-it-toc-and-anchor");

const { dest } = require("./environment.js");
const svelte = require("./svelte.js");
const { version } = require("../package.json");

module.exports = ({ preprocess }) => ({
    name : "rollup-plugin-markdown-html",

    async writeBundle() {
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

        const page = await svelte({ file : require.resolve("../src/page.html") });

        // Get Svelte layout.html & turn it into a function we can use to generate HTML
        const layout = await svelte({
            file : require.resolve("../src/layout.html"),
            preprocess,
        });

        // Walk sections, generating markdown for each
        [ "guide" ].forEach((section) => {
            const files = shell.find(path.resolve(__dirname, `../src/${section}/*.md`));
            
            const sources = files.map((file) => {
                let text = fs.readFileSync(file, "utf8");
            
                // Prefix headers to decrement them all down a level
                text = text.replace(/^#/gm, "##");
                
                return md.render(text);
            });
        
            const content = sources.join("\n");

            const html = page.render({
                title   : section,
                content : layout.render({
                    content,
                    version,
                }),
            });
        
            const dir = path.join(dest, `./${section}`);
            
            shell.mkdir("-p", dir);
            
            fs.writeFileSync(path.join(dir, "./index.html"), html, "utf8");
        });
    }
});
