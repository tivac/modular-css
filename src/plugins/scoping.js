"use strict";

var postcss      = require("postcss"),
    createParser = require("postcss-selector-parser"),
    
    hasha = require("hasha"),
    
    plugin = "postcss-modular-css-scoping";

module.exports = postcss.plugin(plugin, function(opts) {
    var options = opts || {};
    
    return function(css, result) {
        var lookup  = {},
            namer   = options.namer  || result.opts.namer,
            prefix  = options.prefix || result.opts.prefix,
            
            parser, current;
            
        if(!prefix && !namer) {
            prefix = hasha(css.toString(), { algorithm : "md5" });
        }
        
        if(typeof namer !== "function") {
            namer = function(file, selector) {
                return prefix + "_" + selector;
            };
        }

        parser = createParser(function(selectors) {
            selectors.each(function(child) {
                child.each(function(selector) {
                    var children, name;
                    
                    if(selector.type === "pseudo" && selector.value === ":global") {
                        if(!selector.nodes[0] || !selector.nodes[0].nodes.length) {
                            throw current.error(":global(...) requires a child selector", { word : ":global" });
                        }

                        // Store ref to the children & replace :global(...) with them
                        children = selector.nodes[0];
                        selector.replaceWith(children);
                        
                        // Walk the nodes we just shoved in and make sure they're in the output
                        children.nodes.forEach(function(inner) {
                            if(inner.type === "class" || inner.type === "id") {
                                lookup[inner.value] = inner.value;
                            }
                        });
                        
                        return;
                    }
                    
                    if(selector.type === "class" || selector.type === "id") {
                        name = namer(result.opts.from, selector.value);
                        
                        lookup[selector.value] = name;
                        
                        selector.value = name;
                        
                        return;
                    }
                });
            });
        });
        
        // Walk all classes and save off rewritten selectors
        css.walkRules(function(rule) {
            // Save closure ref to this for throwing errors from selector parser
            current = rule;

            rule.selector = parser.process(rule.selector).result;
        });
        
        result.messages.push({
            type    : "modularcss",
            plugin  : plugin,
            classes : lookup
        });
    };
});
