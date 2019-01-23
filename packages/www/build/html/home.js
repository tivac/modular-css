"use strict";

const fs = require("fs");
const path = require("path");

const shell = require("shelljs");

const { dest } = require("../environment.js");

const css = require("./css.js");

// Create home page markup
module.exports = ({ md }) => {
    const Home = require(path.join(dest, "./home.cjs.js"));

    return {
        file : path.join(dest, "./index.html"),
        html : Home.render({
            styles  : css("home"),
            content : md.render(
                fs.readFileSync(require.resolve("../../src/index.md"), "utf8")
            ),
        }),
    };
};
