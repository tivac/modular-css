"use strict";

var rel = require("modular-css-core/lib/relative.js").bind(null, process.cwd());

module.exports = (files) => files.map(rel);
