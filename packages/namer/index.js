"use strict";

var alphabet = require("alphabet"),
    length   = alphabet.lower.length;

module.exports = function() {
    var files = {};
    
    return function namer(file, selector) {
        var prefix = "",
            current, id;
        
        if(!files[file]) {
            files[file] = {
                id        : Object.keys(files).length,
                selectors : {}
            };
        }

        current = files[file];
        id = current.id;
        
        // Has to use "in" because they can be 0 which is falsey
        if(!(selector in current.selectors)) {
            current.selectors[selector] = Object.keys(current.selectors).length;
        }

        // Keep adding letters until we're done
        while(id >= length) {
            prefix += alphabet.lower[length - 1];

            id -= length;
        }

        prefix += alphabet.lower[id];
        
        // Use "_" to split parts so it's never ambiguous which is file and which is selector
        return `${prefix}${current.selectors[selector]}`;
    };
};
