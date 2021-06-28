"use strict";

const selector = require("postcss-selector-parser");
const value = require("postcss-value-parser");

const identifiers = require("../lib/identifiers.js");

module.exports = () => ({
    postcssPlugin : "modular-css-values-replace",

    prepare({ opts }) {
        const { processor, from } = opts;
        
        // const graph = new DepGraph();
        const rewritten = new Set();

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
                // console.log(thing[prop]);

                // TODO: this is too simple and is causing failures if the same value shows up multiple times
                if(rewritten.has(thing[prop])) {
                    return;
                }

                const parsed = value(thing[prop]);

                parsed.walk((node) => {
                    if(node.type !== "word" || !values[node.value]) {
                        return;
                    }

                    let current = values[node.value];
                    let next = current;
                    let count = 0;

                    while(next && count < 10) {
                        next = values[current];

                        if(next) {
                            current = next;
                        }

                        count++;
                    }

                    if(!current) {
                        throw thing.error(`Unable to follow value chain`, { word : node.value });
                    }

                    // Source map support
                    thing.source = current.source;

                    // Replace any value instances
                    node.value = current.value;
                });

                // console.log({ before : thing[prop], after : parsed.toString() });
                
                thing[prop] = parsed.toString();

                rewritten.add(thing[prop]);
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

                console.log("values-replace", rule.selector);
            },
        };
    },
});

module.exports.postcss = true;
