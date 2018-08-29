"use strict";

const processor = require("postcss-selector-parser");

const identifiers = require("../lib/identifiers.js");

const reuse  = "Unable to re-use the same selector for global & local";
const plugin = "modular-css-scoping";

// Validate whether a selector should be renamed, returns the key to use
function rename(current, thing) {
    if(thing.type === "class" ||
       thing.type === "id" ||
       (current.name && current.name.search(identifiers.keyframes) > -1)) {
        return thing.value;
    }

    return false;
}

module.exports = (css, result) => {
    const classes   = Object.create(null);
    const keyframes = Object.create(null);
    const globals   = Object.create(null);

    let current;
    let lookup;

    const parser = processor((selectors) => {
        const pseudos = [];

        selectors.walkPseudos((node) => {
            if(node.value !== ":global") {
                return;
            }

            if(!node.length || !node.first.length) {
                throw current.error(":global(...) must not be empty", { word : ":global" });
            }

            // Can't remove here, see #277 or postcss/postcss-selector-parser#105
            pseudos.push(node);
        });

        pseudos.forEach((node) => {
            // Replace the :global(...) with its contents
            node.replaceWith(processor.selector({
                nodes  : node.nodes,
                source : node.source,
            }));

            node.walk((child) => {
                const key = rename(current, child);

                if(!key) {
                    return;
                }

                // Don't allow local/global overlap (but globals can overlap each other nbd)
                if(key in lookup && !globals[key]) {
                    throw current.error(reuse, { word : key });
                }

                globals[key] = true;
                
                if(result.opts.exportGlobals !== false) {
                    lookup[key] = [ child.value ];
                }
                
                child.ignore = true;
            });
        });

        selectors.walk((node) => {
            const key = rename(current, node);

            if(!key || node.ignore) {
                return;
            }

            // Don't allow local/global overlap
            if(key in globals) {
                throw current.error(reuse, { word : key });
            }

            node.value = result.opts.namer(result.opts.from, node.value);

            lookup[key] = [ node.value ];

            return;
        });
    });

    // Walk all rules and save off rewritten selectors
    css.walkRules((rule) => {
        // Save closure ref to this rule
        current = rule;
        lookup = classes;
        
        rule.selector = parser.processSync(rule);
    });

    // Also scope @keyframes rules so they don't leak globally
    css.walkAtRules(identifiers.keyframes, (rule) => {
        // Save closure ref to this rule
        current = rule;

        lookup = keyframes;

        rule.params = parser.processSync(rule.params);
    });

    if(Object.keys(keyframes).length) {
        result.messages.push({
            type : "modular-css",
            plugin,
            keyframes,
        });
    }

    if(Object.keys(classes).length) {
        result.messages.push({
            type : "modular-css",
            plugin,
            classes,
        });
    }
};

module.exports.postcssPlugin = plugin;
