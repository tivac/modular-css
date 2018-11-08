"use strict";

const selector = require("postcss-selector-parser");
const value    = require("postcss-value-parser");
const escape   = require("escape-string-regexp");
const each     = require("lodash/forEach");
const get      = require("lodash/get");
const Graph    = require("dependency-graph").DepGraph;
    
const namespaced = require("./values-namespaced.js");

module.exports = (css, result) => {
    var graph = new Graph(),
        
        // Create local copy of values since we're going to merge in namespace stuff
        values = Object.assign(
            Object.create(null),
            get(result.opts, [ "files", result.opts.from, "values" ])
        ),

        external = selector((selectors) =>
            selectors.walkTags((tag) => {
                if(!values[tag.value]) {
                    return;
                }

                tag.replaceWith(selector.tag(values[tag.value]));
            })
        ),
        
        matchRegex;
    
    // Replace values inside specific values
    function replacer(prop) {
        return (thing) => {
            var parsed = value(thing[prop]);
            
            parsed.walk((node) => {
                if(node.type !== "word") {
                    return;
                }
                
                // Replace any value instances
                node.value = node.value.replace(matchRegex, (match) => {
                    // Source map support
                    thing.source = values[match].source;
                    
                    return values[match].value;
                });
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
