"use strict";

const path = require("path");

const shell = require("shelljs");

const { dest } = require("../environment.js");

module.exports = (name) =>
    shell
        .find(path.join(dest, `./assets/${name}*.css`))
        .map((css) => path.relative(dest, css).replace(/\\/g, "/"));

