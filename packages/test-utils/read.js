"use strict";

var fs = require("fs"),
    path = require("path");

module.exports = (cwd) =>
    (name) =>
        fs.readFileSync(path.join(cwd, "./output", name), "utf8");
