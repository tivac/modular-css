"use strict";

var alphabet   = require("alphabet"),
    letters    = alphabet,
    everything = letters.concat(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);

function value(source, count) {
    var out = "";

     // Keep adding letters until we're done
    while(count >= 0) {
        out += source[Math.min(count, source.length - 1)];

        count -= source.length;
    }

    return out;
}

module.exports = function() {
    var meta  = {},
        cache = {};
    
    return function namer(file, selector) {
        var key = `${file}${selector}`,
            current;
        
        if(key in cache) {
            return cache[key];
        }
        
        if(!meta[file]) {
            meta[file] = {
                id        : Object.keys(meta).length,
                selectors : {},
            };
        }

        current = meta[file];
        
        // Has to use "in" because they can be 0 which is falsey
        if(!(selector in current.selectors)) {
            current.selectors[selector] = Object.keys(current.selectors).length;
        }

        cache[key] = value(letters, current.id) + value(everything, current.selectors[selector]);

        return cache[key];
    };
};
