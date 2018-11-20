"use strict";

const createParser = require("postcss-selector-parser");

exports.keyframes = /keyframes$/i;

// Find all classes that comprise a selector and return 'em
exports.parse = (selector) => {
    const values = [];
    
    const parser = createParser((selectors) =>
        selectors.walkClasses(({ value }) => values.push(value)
        )
    );
    
    parser.processSync(selector);
    
    return values;
};
