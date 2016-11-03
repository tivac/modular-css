"use strict";

var postcss = require("postcss"),
    parser  = require("postcss-value-parser"),
    each    = require("lodash.foreach"),
    Graph   = require("dependency-graph").DepGraph,

    plugin  = "postcss-modular-css-values-replace",
    simple  = /values-local|values-composed/,
    grouped = /values-namespaced/;

function replacer(values, prop) {
    return (thing) => {
        var parsed = parser(thing[prop]);
        
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

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var graph  = new Graph(),
            values = result.messages
                .filter((msg) => msg.plugin.search(simple) > -1)
                .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
            
        // Merge namespaced values in w/ prefixed names
        result.messages
            .filter((msg) => msg.plugin.search(grouped) > -1)
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

            parser(details.value).walk((node) => {
                if(node.type !== "word" || !values[node.value]) {
                    return;
                }

                graph.addNode(node.value);
                graph.addDependency(name, node.value);
            });
        });

        // Walk through values in dependency order & update any inter-dependent values
        graph.overallOrder().forEach((name) => {
            parser(values[name].value).walk((node) => {
                if(node.type !== "word" || !values[node.value]) {
                    return;
                }

                values[name] = values[node.value];
            });
        });

        // Replace all values
        css.walkDecls(replacer(values, "value"));
        css.walkAtRules(/media|value/, replacer(values, "params"));
    };
});
