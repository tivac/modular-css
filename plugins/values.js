"use strict";

var path = require("path"),
    
    resolve = require("resolve"),
    postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    
    imports = require("../imports"),
    
    format = /^(.+?):(.*)$/i,
    plugin = "postcss-modular-css-values";

function parseBase(rule) {
    var parts = rule.params.match(format),
        out   = {};
    
    out[parts[1].trim()] = parts[2].trim();
    
    return out;
}

function parseImports(options, rule) {
    var parsed = imports.parse(rule.params),
        out    = {},
        source;
    
    if(!options.files) {
        throw rule.error("Invalid @value reference: " + rule.params, { word : rule.params });
    }
    
    source = options.files[resolve.sync(parsed.source, { basedir : path.dirname(options.from) })];
    
    parsed.keys.forEach(function(key) {
        if(!(key in source.values)) {
            throw rule.error("Invalid @value reference: " + key, { word : key });
        }
        
        out[key] = source.values[key];
    });
    
    return out;
}

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
            var locals;
            
            if(rule.params.search(format) > -1) {
                locals = parseBase(rule);
            } else if(rule.params.search(imports.format) > -1) {
                locals = parseImports(result.opts, rule);
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
