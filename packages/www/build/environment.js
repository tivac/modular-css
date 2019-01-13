"use strict";

const path = require("path");

exports.dest = path.resolve(__dirname, "../dist");

exports.isProduction = process.env.NODE_ENV === "production";
exports.isWatch      = process.env.ROLLUP_WATCH;
