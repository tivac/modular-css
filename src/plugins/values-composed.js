"use strict";

var values      = require("./_values"),
    composition = require("../lib/composition");

module.exports = values(
    "postcss-modular-css-values-composed",
    function resolveImports(options, rule) {
        var parsed = composition.rule(options.from, rule),
            out    = {},
            source;
        
        source = options.files[parsed.source];

        parsed.rules.forEach(function(key) {
            if(!(key in source.values)) {
                throw rule.error("Invalid @value reference: " + key, { word : key });
            }
            
            out[key] = source.values[key];
        });
        
        return out;
    }
);
