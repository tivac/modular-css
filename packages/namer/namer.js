"use strict";

const letters = require("alphabet");
const everything = [ ...letters, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

function value(source, count) {
    let out = "";

     // Keep adding letters until we're done
    while(count >= 0) {
        out += source[Math.min(count, source.length - 1)];

        count -= source.length;
    }

    return out;
}

module.exports = function() {
    const meta  = new Map();
    const cache = new Map();
    
    return function namer(file, selector) {
        const key = `${file}${selector}`;
        
        if(cache.has(key)) {
            return cache.get(key);
        }
        
        if(!meta.has(file)) {
            meta.set(file, {
                id        : meta.size,
                selectors : new Map(),
            });
        }

        const { id, selectors } = meta.get(file);
        
        // Has to use "in" because they can be 0 which is falsey
        if(!selectors.has(selector)) {
            selectors.set(selector, selectors.size);
        }

        cache[key] = value(letters, id) + value(everything, selectors.get(selector));

        return cache[key];
    };
};
