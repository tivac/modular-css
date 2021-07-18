"use strict";

const selector = require("postcss-selector-parser");
const value = require("postcss-value-parser");

const identifiers = require("../lib/identifiers.js");

module.exports = () => ({
    postcssPlugin : "modular-css-values-replace",

    prepare({ opts }) {
        const { processor, from } = opts;
        
        const { values } = processor.files[from];

        const parser = selector();

        const external = selector((selectors) =>
            selectors.walkTags((tag) => {
                const source = values[tag.value];
                
                if(!source) {
                    return;
                }

                const ast = parser.astSync(source.value);
                const { type } = ast.first.first;

                tag.replaceWith(selector[type](source));
            })
        );

        // Replace values inside specific values
        const replacer = (prop) =>
            (thing) => {
                const parsed = value(thing[prop]);

                parsed.walk((node) => {
                    if(node.type !== "word" || !values[node.value]) {
                        return;
                    }
                    
                    const current = values[node.value];
                    
                    // Source map support
                    thing.source = current.source;

                    // Replace any value instances
                    node.value = current.value;
                });

                thing[prop] = parsed.toString();
            };

        return {
            Declaration : replacer("value"),
            
            AtRule : {
                media : replacer("params"),
                value : replacer("params"),
            },
            
            Rule(rule) {
                if(!identifiers.externals.test(rule.selector)) {
                    return;
                }
                
                rule.selector = external.processSync(rule);
            },
        };
    },
});

module.exports.postcss = true;
