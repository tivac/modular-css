"use strict";

var values      = require("./_values.js"),
    composition = require("../parsers/composition.js");

module.exports = values(
    "postcss-modular-css-values-composed",
    function resolveImports(options, rule) {
        var parsed = composition.rule(options.from, rule),
            out    = {},
            source;
        
        source = options.files[parsed.source];

        parsed.refs.forEach((ref) => {
            if(!(ref.name in source.values)) {
                throw rule.error(`Invalid @value reference: ${ref.name}`, { word : ref.name });
            }
            
            out[ref.name] = source.values[ref.name];
        });
        
        return out;
    }
);
