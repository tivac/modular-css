"use strict";

var postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    
    format = /^(.+?):(.*)$/,
    plugin = "postcss-modular-css-values";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var values  = {},
            graph   = new Graph(),
            keys, search;
        
        function replacer(text) {
            return text.replace(search, function(match, key) {
                return values[key];
            });
        }

        // Find all defined values, catalog them, and remove them
        css.walkAtRules("value", function(rule) {
            var parts = rule.params.match(format),
                key, val;
            
            if(!parts) {
                throw rule.error("Invalid @value declaration", { plugin : plugin });
            }
            
            key = parts[1];
            val = parts[2].trim();

            values[key] = val;
            graph.addNode(key);
            
            rule.remove();
        });

        keys   = Object.keys(values);
        search = new RegExp("(\\b" + keys.join("\\b|\\b") + "\\b)", "g");

        keys.forEach(function(key) {
            var value = values[key],
                refs  = value.match(search);
            
            if(!refs) {
                return;
            }

            refs.forEach(function(ref) {
                graph.addDependency(key, ref);
            });
        });

        // Ensure that any key references are updated
        graph.overallOrder().forEach(function(key) {
            values[key] = replacer(values[key]);
        });
        
        // Replace all instances of @value keys w/ the value in declarations & @media rules
        css.walkDecls(function(decl) {
            decl.value = replacer(decl.value);
        });

        css.walkAtRules("media", function(rule) {
            rule.params = replacer(rule.params);
        });

        result.messages.push({
            type   : "modularcss",
            plugin : plugin,
            values : values
        });
    };
});
