"use strict";

var fs   = require("fs"),
    path = require("path");

module.exports = (file) =>
    fs.readFileSync(path.resolve(__dirname, "../output", file), "utf8");
