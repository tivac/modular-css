"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const { dest } = require("../environment.js");

const css = require("./css.js");

// Create home page markup
module.exports = ({ md, bundle, graph }) => {
    const entry = "home.cjs.js";
    const file = path.join(dest, "./index.html");
    
    const Home = require(path.join(dest, entry));

    return {
        file,
        html : Home.render({
            styles  : css(entry, { file, graph, bundle }),
            content : md.render(
                fs.readFileSync(require.resolve("../../src/index.md"), "utf8")
            ),
        }),
    };
};
