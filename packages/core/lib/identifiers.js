"use strict";

var createParser = require("postcss-selector-parser"),
    
    keyframes = /keyframes$/i;

exports.keyframes = keyframes;

// TODO: this is probably inefficient, but oh well for now
exports.parse = (selector) => {
    var values = [],
        parser;
    
    parser = createParser((selectors) => {
        // Walk classes
        selectors.walkClasses((part) => values.push(part.value));
        
        // Walk IDs
        selectors.walkIds((part) => values.push(part.value));
        
        // Walk @keyframes definitions
        selectors.walkTags((part) => {
            // This is a slightly ridiculous conditional, but postcss-selector-parser
            // spits out @keyframes <name> as [ @keyframes, <name> ] so we have to do
            // this flopping around to find the real value. Blech.
            if(part.parent.nodes[0] &&
               part.parent.nodes[0] !== part  &&
               part.parent.nodes[0].value.search(keyframes) > -1) {
                values.push(part.value);
            }
        });
    });
    
    parser.process(selector);
    
    return values;
};
