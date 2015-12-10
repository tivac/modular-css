"use strict";

var values      = require("./_values"),
    composition = require("../_composition");

module.exports = values(
    "postcss-modular-css-values-composed",
    function resolveImports(options, rule) {
        var parsed = composition(options.from, rule.params),
            out    = {},
            source;
        
        if(!options.files || !options.files[parsed.source]) {
            throw rule.error("Invalid file reference: " + rule.params, { word : rule.params });
        }
        
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
