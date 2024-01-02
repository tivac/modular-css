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

module.exports = ({ verbose = false } = false) => {
    const meta  = new Map();
    const cache = new Map();
    
    return function namer(file, selector) {
        const key = `${file}${selector}`;
        
        
        if(cache.has(key)) {
            return cache.get(key);
        }
        
        if(!meta.has(file)) {
            if(verbose) {
                // eslint-disable-next-line no-console -- debug logging
                console.log(`NAMER: Seen ${file} for the first time`);
            }

            meta.set(file, {
                id        : meta.size,
                selectors : new Map(),
            });
        }

        const { id, selectors } = meta.get(file);
        
        // Don't need to cache this because repeats were caught by the cache up above
        selectors.set(selector, selectors.size);

        const output = value(letters, id) + value(everything, selectors.get(selector));

        cache.set(key, output);

        if(verbose) {
            // eslint-disable-next-line no-console -- debug logging
            console.log(`NAMER: ${key} => ${output}`);
        }

        return output;
    };
};
