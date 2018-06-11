"use strict";

const selector = require("postcss-selector-parser");
const value    = require("postcss-value-parser");
const escape   = require("escape-string-regexp");
const each     = require("lodash.foreach");
const get      = require("lodash.get");
const Graph    = require("dependency-graph").DepGraph;
    
const namespaced = require("./values-namespaced.js");

module.exports = (css, result) => {
    const graph = new Graph();
        
    // Create local copy of values since we're going to merge in namespace stuff
    const values = Object.assign(
        Object.create(null),
        get(result.opts, [ "files", result.opts.from, "values" ])
    );

    const external = selector((selectors) =>
        selectors.walkTags((tag) => {
            if(!values[tag.value]) {
                return;
            }

            tag.replaceWith(selector.tag(values[tag.value]));
        })
    );
        
    let matchRegex;
    
    // Replace values inside specific values
    function replacer(prop) {
        return (thing) => {
            var parsed = value(thing[prop]);

            parsed.walk((node, idx, nodes) => {
                // Replace any simple value instances
                if(node.type === "word") {
                    node.value = node.value.replace(matchRegex, (match) => {
                        const v = values[match];
    
                        // Source map support
                        thing.source = v.source;
                        
                        return v.value;
                    });
                }

                // function replacement
                if(node.type === "function" && node.value in values) {
                    const v = values[node.value];
                    const args = {};

                    // Build up map of args => values
                    v.args.forEach((arg, pos) => {
                        args[arg] = node.nodes[pos].value;
                    });

                    // Replace all arg instances w/ the value
                    const updated = v.value.replace(v.search, (_, arg) => args[arg]);

                    // Parse the result
                    const replacement = value(updated);

                    thing.source = v.source;

                    // Splice the result over the previous value
                    nodes.splice(idx, 1, ...replacement.nodes);
                }
            });

            thing[prop] = parsed.toString();
        };
    }
        
    // Merge namespaced values in w/ prefixed names
    result.messages
        .filter((msg) => msg.plugin === namespaced.postcssPlugin)
        .forEach((msg) =>
            each(msg.values, (children, ns) =>
                each(children, (details, child) => (values[`${ns}.${child}`] = details))
            )
        );
    
    // Bail if no work to do
    if(!Object.keys(values).length) {
        return;
    }

    matchRegex = new RegExp(
        Object.keys(values)
            .sort((a, b) => b.length - a.length)
            .map((v) => `\\b${escape(v)}\\b`)
            .join("|"),
        "g"
    );

    // Walk through all values & build dependency graph
    each(values, (details, name) => {
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
        var parsed = value(values[name].value);
        
        parsed.walk((node) => {
            if(node.type !== "word" || !values[node.value]) {
                return;
            }

            node.value = values[node.value].value;
        });

        values[name].value = parsed.toString();
    });

    // Replace values in property values
    css.walkDecls(replacer("value"));

    // Replace values in @media/@value
    css.walkAtRules(/media|value/, replacer("params"));

    // Replace values in :external() references
    css.walkRules(/:external/, (rule) => {
        rule.selector = external.processSync(rule);
    });
};

module.exports.postcssPlugin = "modular-css-values-replace";
