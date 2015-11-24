"use strict";

var postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    parser  = require("postcss-value-parser"),
    
    composition = require("../_composition"),

    plugin = "postcss-modular-css-values";

function parseBase(parts) {
    var out = {};
    
    if(parts[0].type === "word" && parts[1].type === "div" && parts[1].value === ":") {
        out[parts[0].value] = parser.stringify(parts.slice(2));

        return out;
    }

    return false;
}

function resolveImports(options, rule, parts) {
    var parsed = composition(options.from, parts),
        out    = {},
        source;
    
    if(!options.files || !options.files[parsed.source]) {
        throw rule.error("Invalid file reference: " + rule.params, { word : rule.params });
    }
    
    source = options.files[parsed.source];

    parsed.rules.forEach(function(key) {
        if(!(key in source.values)) {
            throw rule.error("Invalid @value reference: " + key, { word : key });
        }
        
        out[key] = source.values[key];
    });
    
    return out;
}

function replacer(values, search, text) {
    return text.replace(search, function(match, key) {
        return values[key];
    });
}

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var values  = {},
            graph   = new Graph(),
            keys, search;

        // Find all defined values, catalog them, and remove them
        css.walkAtRules("value", function(rule) {
            var parsed = parser(rule.params).nodes,
                locals = parseBase(parsed);

            // If we couldn't parse as a simple key: value rule it's either broken
            // or a composition rule, so try that way
            if(!locals) {
                locals = resolveImports(result.opts, rule, parsed);
            }

            Object.keys(locals).forEach(function(key) {
                values[key] = locals[key];
                graph.addNode(key);
            });
            
            rule.remove();
        });
        
        keys = Object.keys(values);
        
        // Early out if no values to process
        if(!keys.length) {
            return;
        }
        
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
            values[key] = replacer(values, search, values[key]);
        });

        // Replace all instances of @value keys w/ the value in declarations & @media rules
        css.walkDecls(function(decl) {
            decl.value = replacer(values, search, decl.value);
        });

        css.walkAtRules("media", function(rule) {
            rule.params = replacer(values, search, rule.params);
        });

        result.messages.push({
            type   : "modularcss",
            plugin : plugin,
            values : values
        });
    };
});
