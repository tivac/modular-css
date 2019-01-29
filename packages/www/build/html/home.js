"use strict";

const fs = require("fs");
const path = require("path");

const get = require("import-fresh");

const { src, dest } = require("../environment.js");

const css = require("./css.js");

// Create home page markup
module.exports = ({ bundle, graph }) => {
    const md = require("./markdown.js")();

    const entry = "home.cjs.js";
    const file = path.join(dest, "./index.html");

    const example = md.render(
        fs.readFileSync(path.join(src, "./home/example.md"), "utf8")
    );
    
    const intro = md.render(
        fs.readFileSync(path.join(src, "./home/intro.md"), "utf8")
    );
    
    const Home = get(path.join(dest, entry));

    return {
        file,
        html : Home.render({
            example,
            intro,
            styles : css(entry, {
                file,
                graph,
                bundle,
                styles : [
                    "prism"
                ]
            }),
        }),
    };
};
