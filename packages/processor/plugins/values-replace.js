"use strict";

const selector = require("postcss-selector-parser");
const value = require("postcss-value-parser");
const escape = require("escape-string-regexp");
const { DepGraph } = require("dependency-graph");

const identifiers = require("../lib/identifiers.js");

module.exports = () => ({
    postcssPlugin : "modular-css-values-replace",

    prepare({ opts }) {
        const { processor, from } = opts;
        
        const graph = new DepGraph();
        const rewritten = new Set();

        // Create local copy of values since we're going to merge in namespace stuff
        const values = {
            __proto__ : null,
            
            ...processor.files[from].values,
        };

        const external = selector((selectors) =>
            selectors.walkTags((tag) => {
                if(!values[tag.value]) {
                    return;
                }

                tag.replaceWith(selector.tag(values[tag.value]));
            })
        );

        // Replace values inside specific values
        const replacer = (prop) =>
            (thing) => {
                console.log(thing[prop]);

                if(rewritten.has(thing[prop])) {
                    return;
                }

                const parsed = value(thing[prop]);

                parsed.walk((node) => {
                    if(node.type !== "word" || !values[node.value]) {
                        return;
                    }

                    // Source map support
                    thing.source = values[node.value].source;

                    // Replace any value instances
                    node.value = values[node.value].value;
                });

                thing[prop] = parsed.toString();

                rewritten.add(thing[prop]);
            };

        // TODO: this can't work any more, because the values aren't known yet on the first pass
        // TODO: maybe need a basic replacer solely for the first pass?
        // Walk through all values & build dependency graph
        Object.entries(values).forEach(([ name, details ]) => {
            graph.addNode(name);

            value(details.value).walk((node) => {
                if(node.type !== "word" || !values[node.value]) {
                    return;
                }

                graph.addNode(node.value);
                graph.addDependency(name, node.value);
            });
        });

        // Walk through values in dependency order & update any inter-dependent values
        graph.overallOrder().forEach((name) => {
            const parsed = value(values[name].value);

            parsed.walk((node) => {
                if(node.type !== "word" || !values[node.value]) {
                    return;
                }

                node.value = values[node.value].value;
            });

            values[name].value = parsed.toString();
        });

        return {
            Declaration : replacer("value"),
            
            AtRule : {
                media : replacer("params"),
                value : replacer("params"),
            },
            
            Rule(rule) {
                if(rewritten.has(rule.selector) || !identifiers.externals.test(rule.selector)) {
                    return;
                }

                rule.selector = external.processSync(rule);

                rewritten.add(rule.selector);
            },
        };
    },
});

module.exports.postcss = true;
