"use strict";

var selector = require("postcss-selector-parser"),
    value    = require("postcss-value-parser"),
    each     = require("lodash.foreach"),
    Graph    = require("dependency-graph").DepGraph;

function replacer(values, prop) {
    return (thing) => {
        var parsed = value(thing[prop]);
        
        parsed.walk((node) => {
            if(node.type !== "word" || !values[node.value]) {
                return;
            }
            
            thing.source = values[node.value].source;
            node.value   = values[node.value].value;
        });

        thing[prop] = parsed.toString();
    };
}

module.exports = (css, result) => {
    var graph  = new Graph(),
        
        // Create local copy of values since we're going to merge in namespace stuff
        values = Object.assign(
            Object.create(null),
            result.opts.files ? result.opts.files[result.opts.from].values : {}
        ),

        external = selector((selectors) =>
            selectors.walkTags((tag) => {
                if(!values[tag.value]) {
                    return;
                }

                tag.replaceWith(values[tag.value].value);
            })
        );
        
    // Merge namespaced values in w/ prefixed names
    result.messages
        .filter((msg) => msg.plugin === "postcss-modular-css-values-namespaced")
        .forEach((msg) =>
            each(msg.values, (children, ns) =>
                each(children, (details, child) => (values[`${ns}.${child}`] = details))
            )
        );
    
    // Bail if no work to do
    if(!Object.keys(values).length) {
        return;
    }

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
        value(values[name].value).walk((node) => {
            if(node.type !== "word" || !values[node.value]) {
                return;
            }

            values[name] = values[node.value];
        });
    });

    // Replace values in property values
    css.walkDecls(replacer(values, "value"));

    // Replace values in @media/@value
    css.walkAtRules(/media|value/, replacer(values, "params"));

    // Replace values in :external() references
    css.walkRules(/:external/, (rule) =>
        (rule.selector = external.process(rule.selector).result)
    );
};

module.exports.postcssplugin = "modular-css-values-replace";
