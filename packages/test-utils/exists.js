"use strict";

const path = require("path");

const shell = require("shelljs");

module.exports = (cwd) =>
    (name) => shell.test("-f", path.join(cwd, "./output", name));
