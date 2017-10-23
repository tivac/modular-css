"use strict";

var selector = require("postcss-selector-parser"),

    parser  = require("../parsers/parser.js");

// Find :external(<rule> from <file>) references and update them to be
// the namespaced selector instead
module.exports = (css, result) => {
    function process(rule, pseudo) {
        var params = pseudo.nodes.toString(),
            parsed = parser.parse(params),
            root   = selector.root(),
            source;

        if(parsed.type !== "composition") {
            throw rule.error(
                "externals must be from another file",
                { word : params }
            );
        }

        source = result.opts.files[
            result.opts.resolve(result.opts.from, parsed.source)
        ];

        // There will only ever be one, but this is nicer
        parsed.refs.forEach((ref) => {
            var s;
            
            if(!source.exports[ref.name]) {
                throw rule.error(`Invalid external reference: ${ref.name}`, { word : ref.name });
            }

            // This was a... poor naming choice
            s = selector.selector();

            source.exports[ref.name].forEach((name) =>
                s.append(selector.className({ value : name }))
            );
            
            root.append(s);
        });

        pseudo.replaceWith(root);
    }
    
    css.walkRules(/:external/, (rule) => {
        var externals = selector((selectors) => {
                var found = [];
                
                selectors.walkPseudos((pseudo) => {
                    // Need to ensure we only process :external pseudos, see #261
                    if(pseudo.value !== ":external") {
                        return;
                    }
                    
                    // Can't replace here, see postcss/postcss-selector-parser#105
                    found.push(pseudo);
                });

                found.forEach((pseudo) => process(rule, pseudo));
            });
        
        externals.processSync(rule);
    });
};

module.exports.postcssPlugin = "modular-css-externals";
