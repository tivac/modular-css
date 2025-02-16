"use strict";

const selectorParser = require("postcss-selector-parser");

const valueParser = require("../parsers/values.js");

const valueReplacer = require("../lib/value-replacer.js");
const identifiers = require("../lib/identifiers.js");

module.exports = () => ({
    postcssPlugin : "modular-css-values-replace",

    prepare({ opts }) {
        const { processor, from } = opts;
        
        const { values } = processor.files[from];

        const parser = selectorParser();

        const external = selectorParser((selectors) =>
            selectors.walkTags((tag) => {
                const source = values[tag.value];
                
                if(!source) {
                    return;
                }

                const ast = parser.astSync(source.value);
                const { type } = ast.first.first;

                tag.replaceWith(selectorParser[type](source));

                processor._addSelector(from, tag.toString());
                processor._graph.addDependency(from, tag.value);
            })
        );

        return {
            AtRule : {
                value(rule) {
                    valueReplacer(rule, "params", values, (find, replace) => {
                        const details = valueParser.parse(rule.params);
                        const vkey = processor._addValue(from, details.name);
                        
                        processor._graph.addDependency(vkey, replace.graphKey);
                    });
                },

                media(rule) {
                    valueReplacer(rule, "params", values);
                },
            },

            // Only replace in selectors if they use an :external() reference
            Rule(rule) {
                if(!identifiers.externals.test(rule.selector)) {
                    return;
                }
                
                rule.selector = external.processSync(rule);
            },

            Declaration(decl) {
                valueReplacer(decl, "value", values, (find, replace) => {
                    const skey = processor._addSelector(from, decl.parent.selector);
                    
                    processor._graph.addDependency(skey, replace.graphKey);
                });
            },
        };
    },
});

module.exports.postcss = true;
