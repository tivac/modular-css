"use strict";

const selector = require("postcss-selector-parser");

const parser = require("../parsers/external.js");

// Find :external(<rule> from <file>) references and update them to be
// the namespaced selector instead
module.exports = () => {
    let process;

    return {
        postcssPlugin : "modular-css-externals",

        Once(css, { result }) {
            const { processor, from } = result.opts;

            process = (rule, pseudo) => {
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
        },

        Rule(rule) {
            const externals = selector((selectors) => {
                const found = [];

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

            rule.selector = externals.processSync(rule);
        },
    };
};

module.exports.postcss = true;
