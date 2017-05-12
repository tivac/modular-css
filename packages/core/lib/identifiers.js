"use strict";

var createParser = require("postcss-selector-parser");

exports.keyframes = /keyframes$/i;

// Find all classes that comprise a selector and return 'em
exports.parse = (selector) => {
    var values = [],
        parser;
    
    parser = createParser((selectors) => {
        selectors.walkClasses((part) => values.push(part.value));
    });
    
    parser.process(selector);
    
    return values;
};
