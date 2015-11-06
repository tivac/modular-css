"use strict";

var postcss      = require("postcss"),
    createParser = require("postcss-selector-parser"),
    
    hasha = require("hasha"),
    
    plugin = "postcss-modular-css-scoping";

module.exports = postcss.plugin(plugin, function(opts) {
    var options = opts || {};
    
    return function(css, result) {
        var lookup  = {},
            namer   = options.namer,
            prefix  = options.prefix,
            
            parser;
            
        if(!prefix && !namer) {
            prefix = hasha(css.toString(), { algorithm : "md5" });
        }
        
        if(typeof namer !== "function") {
            namer = function(selector) {
                return prefix + "_" + selector;
            };
        }
        
        parser = createParser(function(selectors) {
            // Walk top-level selectors
            selectors.each(function(child) {
                // Walk the parts of each
                child.each(function(selector) {
                    var inner, name;
                    
                    if(selector.type === "pseudo" && selector.value === ":global") {
                        // Only support a single child, because simplicity
                        inner = selector.nodes[0].nodes[0];
                        
                        // Replace :global() with its contents
                        selector.replaceWith(inner);
                        
                        if(inner.type === "class" || inner.type === "id") {
                            lookup[inner.value] = inner.value;
                        }
                        
                        return;
                    }
                    
                    if(selector.type === "class" || selector.type === "id") {
                        name = namer(selector.value);
                        
                        lookup[selector.value] = name;
                        
                        selector.value = name;
                        
                        return;
                    }
                });
            });
        });
        
        // Walk all classes and save off rewritten selectors
        css.walkRules(function(rule) {
            rule.selector = parser.process(rule.selector).result;
        });
        
        result.messages.push({
            type    : "modularcss",
            plugin  : plugin,
            classes : lookup
        });
    };
});
