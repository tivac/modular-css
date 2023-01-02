"use strict";

module.exports = {
    // Rebuild parsing code any time the sources change
    "*.pegjs" : "node parsers/build.js",
};
