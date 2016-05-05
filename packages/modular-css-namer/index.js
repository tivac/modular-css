"use strict";

var digit = /^\d/;

module.exports = function() {
    var files = {};
    
    return function namer(file, selector) {
        var prefix;
        
        if(!files[file]) {
            files[file] = {
                id        : Object.keys(files).length,
                selectors : {}
            };
        }
        
        // Has to use "in" because they can be 0 which is falsey
        if(!(selector in files[file].selectors)) {
            files[file].selectors[selector] = Object.keys(files[file].selectors).length;
        }
        
        prefix = files[file].id.toString(36);
        
        // CSS classes have to start w/ a letter, so prefix them if necessary
        if(digit.test(prefix)) {
            prefix = "a" + prefix;
        }
        
        // Use "_" to split parts so it's never ambiguous which is file and which is selector
        return prefix + "_" + files[file].selectors[selector].toString(36);
    };
};
