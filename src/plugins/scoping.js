"use strict";

var postcss   = require("postcss"),
    processor = require("postcss-selector-parser"),
        
    identifiers = require("../lib/identifiers"),
    
    plugin = "postcss-modular-css-scoping";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var lookup = {},
            parser, current;
            
        // Validate whether a selector should be renamed, returns the key to use
        function rename(thing) {
            if(thing.type === "class" || thing.type === "id") {
                return thing.value;
            }
            
            if(current.name && current.name.search(identifiers.keyframes) > -1) {
                return thing.value;
            }
            
            return false;
        }

        parser = processor(function(selectors) {
            selectors.walkPseudos(function(node) {
                if(node.value !== ":global") {
                    return;
                }
                
                if(!node.length || !node.first.length) {
                    throw current.error(":global(...) must not be empty", { word : ":global" });
                }
                
                // Replace the :global(...) with its contents
                node.replaceWith(processor.selector({
                    nodes : node.nodes
                }));
                
                node.walk(function(child) {
                    var key = rename(child);
                    
                    if(!key) {
                        return;
                    }

                    if(key in lookup) {
                        throw current.error("Unable to re-use the same selector for global & local", { word : key });
                    }
                    
                    lookup[key] = [ child.value ];
                    child.ignore = true;
                });
            });
            
            selectors.walk(function(node) {
                var key = rename(node);
                
                if(!key || node.ignore) {
                    return;
                }

                node.value = result.opts.namer(result.opts.from, node.value);
                
                lookup[key] = [ node.value ];
                
                return;
            });
        });
        
        // Walk all rules and save off rewritten selectors
        css.walkRules(function(rule) {
            // Save closure ref to this for throwing errors from selector parser
            current = rule;

            rule.selector = parser.process(rule.selector).result;
        });

        // Also scope @keyframes rules so they don't leak globally
        css.walkAtRules(identifiers.keyframes, function(rule) {
            // Save closure ref to this for throwing errors from selector parser
            current = rule;

            rule.params = parser.process(rule.params).result;
        });
        
        result.messages.push({
            type    : "modularcss",
            plugin  : plugin,
            classes : lookup
        });
    };
});
