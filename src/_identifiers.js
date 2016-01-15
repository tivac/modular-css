"use strict";

var createParser = require("postcss-selector-parser"),
    
    keyframes = /keyframes$/i;

exports.keyframes = keyframes;

// TODO: this is probably inefficient, but oh well for now
exports.parse = function parse(selector) {
    var values = [];
    
    createParser(function(selectors) {
        // Walk classes
        selectors.eachClass(function(part) {
            values.push(part.value);
        });
        
        // Walk IDs
        selectors.eachId(function(part) {
            values.push(part.value);
        });
        
        // Walk @keyframes definitions
        selectors.eachTag(function(part) {
            // This is a slightly ridiculous conditional, but postcss-selector-parser
            // spits out @keyframes <name> as [ @keyframes, <name> ] so we have to do
            // this flopping around to find the real value. Blech.
            if(part.parent.nodes[0] &&
               part.parent.nodes[0] !== part  &&
               part.parent.nodes[0].value.search(keyframes) > -1) {
                values.push(part.value);
            }
        });
    }).process(selector);
    
    return values;
};
