const path = require("path");

const dest = path.resolve(__dirname, "../dist");

exports.dest = dest;

const isProduction = process.env.NODE_ENV === "production";

exports.isProduction = isProduction;

const isWatch = process.env.ROLLUP_WATCH;

exports.isWatch = isWatch;
