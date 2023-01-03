"use strict";

const createParser = require("postcss-selector-parser");

const classExtractionParser = createParser((selectors) => {
    const values = [];

    selectors.walkClasses(({ value }) => values.push(value));

    return values;
});

exports.keyframes = /keyframes$/i;
exports.animations = /animation$|animation-name$/i;
exports.externals = /:external\(/i;

// Find all classes that comprise a selector and return 'em
exports.parse = (selector) => classExtractionParser.transformSync(selector);
