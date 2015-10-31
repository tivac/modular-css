"use strict";

var path = require("path"),

    postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    get     = require("lodash.get"),
    
    format = /(.+) from ["']([^'"]+?)["']$/i,
    plugin = "postcss-modular-css-imports";

function parse(text) {
    var parts  = text.match(format),
        values = parts[1].split(","),
        source = parts[2];
    
    // Clean up values first
    values = values.map(function(value) {
        return value.trim();
    });
    
    return {
        values : values,
        source : source
    };
}

module.exports = postcss.plugin(plugin, function(opts) {
    var options = opts || {};
    
    return function(css, result) {
        var files  = {},
            graph  = new Graph(),
            source = path.resolve(options.from || get(css, "nodes[0].source.input.file")),
            root   = options.root || (source && path.dirname(source)) || process.cwd();
        
        console.log(source, root);
        
        graph.addNode(source);
        
        css.walkAtRules("value", function(rule) {
            var parsed = parse(rule.params),
                file   = path.resolve(root, parsed.source);
            
            graph.addNode(file);
            graph.addDependency(source, file);
        });
        
        css.walkDecls("composes", function(decl) {
            var parsed = parse(decl.value),
                file   = path.resolve(root, parsed.source);
            
            graph.addNode(file);
            graph.addDependency(source, file);
        });
        
        console.log(graph.overallOrder());

        result.messages.push({
            type   : "modularcss",
            plugin : plugin,
            files  : files
        });
    };
});
