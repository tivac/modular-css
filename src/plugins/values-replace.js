"use strict";

var postcss = require("postcss"),
    parser  = require("postcss-value-parser"),
    each    = require("lodash.foreach"),

    plugin  = "postcss-modular-css-values-replace",
    matches = /values-local|values-composed/;

function replacer(values, prop) {
    return (thing) => {
        var parsed = parser(thing[prop]);
        
        parsed.walk((node) => {
            if(node.type !== "word" || !values[node.value]) {
                return;
            }
            
            // Re-assign source first because we're changing the key (node.value) otherwise
            // Only storing the last source that applied, we can only use one anyways
            thing.source = values[node.value].source;
            thing[prop]  = values[node.value].value;
        });
    };
}

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var values = result.messages
                .filter((msg) => msg.plugin.search(matches) > -1)
                .reduce((prev, curr) => Object.assign(prev, curr.values), Object.create(null));
        
        // Bail if no values
        if(!Object.keys(values).length) {
            return;
        }

        // Walk through all values &  update any inter-dependent values
        // before replacing anything in the CSS
        each(values, (details, name) => {
            parser(details.value).walk((node) => {
                if(node.type !== "word" || !values[node.value]) {
                    return;
                }

                values[name] = values[node.value];
            });
        });
        
        // Replace all instances of @value keys w/ the value
        css.walkDecls(replacer(values, "value"));
        css.walkAtRules(/media|value/, replacer(values, "params"));
    };
});
