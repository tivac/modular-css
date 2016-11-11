"use strict";

var postcss  = require("postcss"),
    selector = require("postcss-selector-parser"),

    parser  = require("../parsers/parser.js"),
    resolve = require("../lib/resolve.js"),
    
    plugin = "postcss-modular-css-externals";

// Find :external(<rule> from <file>) references and update them to be
// the namespaced selector instead
module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        css.walkRules(/:external/, (rule) => {
            var externals = selector((selectors) =>
                    selectors.walkPseudos((pseudo) => {
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

                        try {
                            source = result.opts.files[resolve(result.opts.from, parsed.source)];
                        } catch(e) {
                            // NO-OP
                        }

                        if(!source) {
                            throw rule.error(
                                "Unknown external source",
                                { word : parsed.source }
                            );
                        }

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
                    })
                );
            
            rule.selector = externals.process(rule.selector).result;
        });
    };
});
