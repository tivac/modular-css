"use strict";

var postcss = require("postcss"),
    hasha   = require("hasha"),
    Parser  = require("postcss-selector-parser"),
    
    name = "postcss-modular-css-scoping";

module.exports = postcss.plugin(name, function(opts) {
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
        
        parser = Parser(function(selectors) {
            // Walk top-level selectors
            selectors.each(function(child) {
                // Walk the parts of each
                child.each(function(selector) {
                    var inner, name;
                    
                    // We only support simple selectors
                    if(selector.parent.nodes.length > 1) {
                        return;
                    }
                    
                    if(selector.type === "pseudo" && selector.value === ":global") {
                        // Only support a single child, because simplicity
                        inner = selector.nodes[0].nodes[0];
                        
                        if(inner.type !== "class" && inner.type !== "id") {
                            return;
                        }
                        
                        // Replace :global() with its contents
                        selector.replaceWith(inner);
                        
                        lookup[inner.value] = inner.value;
                        
                        return false;
                    }
                    
                    if(selector.type === "class" || selector.type === "id") {
                        name = namer(selector.value);
                        
                        lookup[selector.value] = name;
                        
                        selector.value = name;
                        
                        return false;
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
            plugin  : name,
            classes : lookup
        });
    };
});
