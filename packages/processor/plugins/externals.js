"use strict";

const selector = require("postcss-selector-parser");

const parser = require("../parsers/external.js");

// Find :external(<rule> from <file>) references and update them to be
// the namespaced selector instead
module.exports = () => ({
    postcssPlugin : "modular-css-externals",

    prepare(result) {
        const { processor, from } = result.opts;

        const process = (rule, pseudo) => {
            const params = pseudo.nodes.toString();
            
            const { source, ref } = parser.parse(params);
            const { name } = ref;
            const file = processor.files[processor.resolve(from, source)];

            if(!file.classes[name]) {
                throw rule.error(`Invalid external reference: ${name}`, { word : name });
            }

            // This was a... poor naming choice
            const s = selector.selector();

            file.classes[name].forEach((value) =>
                s.append(selector.className({ value }))
            );

            const root = selector.root();

            root.append(s);

            pseudo.replaceWith(root);
        };

        return {
            Rule(rule) {
                const externals = selector((selectors) => {
                    selectors.walkPseudos((pseudo) => {
                        // Need to ensure we only process :external pseudos, see #261
                        if(pseudo.value !== ":external") {
                            return;
                        }
    
                        process(rule, pseudo);
                    });
                });

                rule.selector = externals.processSync(rule);
            },
        };
    },
});

module.exports.postcss = true;
