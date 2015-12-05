"use strict";

var postcss      = require("postcss"),
    createParser = require("postcss-selector-parser"),
    
    unique = require("unique-slug"),

    identifiers = require("../_identifiers"),
    
    plugin = "postcss-modular-css-scoping";

module.exports = postcss.plugin(plugin, function(opts) {
    var options = opts || {};
    
    return function(css, result) {
        var lookup  = {},
            namer   = options.namer  || result.opts.namer,
            prefix  = options.prefix || result.opts.prefix,
            
            parser, current;
            
        if(!prefix && !namer) {
            namer = function(file, selector) {
                return "mc" + unique(file) + "_" + selector;
            };
        }
        
        if(typeof namer !== "function") {
            namer = function(file, selector) {
                return prefix + "_" + selector;
            };
        }

        // Validate whether a selector should be renamed
        function rename(thing) {
            return (
                thing.type === "class" ||
                thing.type === "id" ||
                (current.name && current.name.search(identifiers.keyframes) > -1)
            );
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
                            if(rename(inner)) {
                                lookup[inner.value] = inner.value;
                            }
                        });

                        return;
                    }
                    
                    if(rename(selector)) {
                        name = namer(result.opts.from, selector.value);
                        
                        lookup[selector.value] = name;
                        
                        selector.value = name;
                        
                        return;
                    }
                });
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
