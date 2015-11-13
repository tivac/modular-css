"use strict";

var postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    
    imports = require("../_imports"),
    
    format = /^(.+?):(.*)$/i,
    plugin = "postcss-modular-css-values";

function parseBase(rule) {
    var parts = rule.params.match(format),
        out   = {};
    
    out[parts[1].trim()] = parts[2].trim();
    
    return out;
}

function resolveImports(options, rule) {
    var parsed = imports.parse(options.from, rule.params),
        out    = {},
        source;
    
    if(!options.files || !options.files[parsed.source]) {
        throw rule.error("Invalid file reference: " + rule.params, { word : rule.params });
    }
    
    source = options.files[parsed.source];

    parsed.keys.forEach(function(key) {
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
            var locals;
            
            if(rule.params.search(format) > -1) {
                locals = parseBase(rule);
            } else if(imports.match(rule.params)) {
                locals = resolveImports(result.opts, rule);
            } else {
                throw rule.error("Invalid @value declaration", { word : rule.params });
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
