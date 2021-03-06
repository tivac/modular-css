"use strict";

const createParser = require("postcss-selector-parser");

const parser = createParser((selectors) => {
    const values = [];

    selectors.walkClasses(({ value }) => values.push(value));

    return values;
});

exports.keyframes = /keyframes$/i;

// Find all classes that comprise a selector and return 'em
exports.parse = (selector) => parser.transformSync(selector);
