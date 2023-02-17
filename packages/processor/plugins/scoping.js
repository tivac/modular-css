"use strict";

const selectorParser = require("postcss-selector-parser");
const valueParser = require("postcss-value-parser");

const identifiers = require("@modular-css/utils/identifiers.js");

const { isStamped, stamp } = require("../lib/stamp.js");

const reuse  = "Unable to re-use the same selector for global & local";
const plugin = "modular-css-scoping";

// Validate whether a selector should be renamed, returns the key to use
const rename = ({ name }, { type, value }) => {
    if(type === "class" ||
       type === "id" ||
       (name && name.search(identifiers.keyframes) > -1)) {
        return value;
    }

    return false;
};

module.exports = () => ({
    postcssPlugin : plugin,

    prepare(result) {
        const { from, processor, namer } = result.opts;
        const { exportGlobals } = processor.options;
        const { classes } = processor.files[from];

        const globals = new Set();

        const keyframes = Object.create(null);
        
        let current;
        let lookup;
        
        const parser = selectorParser((selectors) => {
            selectors.walkPseudos((node) => {
                if(node.value !== ":global") {
                    return;
                }
    
                if(!node.length || !node.first.length) {
                    throw current.error(":global(...) must not be empty", { word : ":global" });
                }

                const replacement = selectorParser.selector({
                    nodes  : node.nodes,
                    source : node.source,
                });
    
                // Replace the :global(...) with its contents
                node.replaceWith(replacement);

                node = replacement;
    
                node.walk((child) => {
                    const key = rename(current, child);
    
                    if(!key) {
                        return;
                    }
    
                    // Don't allow local/global overlap if they're being exported
                    // (but globals can overlap each other nbd)
                    if(exportGlobals && lookup[key] && !globals.has(key)) {
                        throw current.error(reuse, { word : key });
                    }
    
                    globals.add(key);
                    
                    if(exportGlobals !== false) {
                        lookup[key] = [ child.value ];
                    }
                    
                    child.global = true;
                });
            });

            selectors.walk((node) => {
                const key = rename(current, node);
    
                if(!key || node.global) {
                    return;
                }

                // Don't allow local/global overlap if they're being exported
                if(exportGlobals && globals.has(key)) {
                    throw current.error(reuse, { word : key });
                }
    
                node.value = namer(from, node.value);
    
                lookup[key] = [ node.value ];
    
                return;
            });
        });

        return {
            Root(root) {
                // Scope @keyframes so they don't leak globally
                // Has to be done via .walk() API so that it happens before
                // animation declarations are parsed, otherwise we don't know
                // which part to update w/o building a smarter parser
                root.walkAtRules(identifiers.keyframes, (rule) => {
                    if(isStamped(rule)) {
                        return;
                    }
                    
                    // Save closure ref to this rule
                    current = rule;
                    
                    lookup = keyframes;
                    
                    rule.params = parser.processSync(rule.params);

                    stamp(rule);
                });
            },

            // Walk all rules and save off rewritten selectors
            Rule(rule) {
                // Don't re-scope rules
                if(isStamped(rule)) {
                    return;
                }

                // Don't process the children of @keyframes, they don't need scoping
                if(rule.parent.type === "atrule" && rule.parent.name === "keyframes") {
                    return;
                }

                // Save closure ref to this rule
                current = rule;
                lookup = classes;
                
                rule.selector = parser.processSync(rule);

                stamp(rule);
            },
    
            // Also scope @keyframes rules so they don't leak globally
            // AtRule(rule) {
            //     // Don't re-scope rules, and only care about @keyframes or prefixed variations
            //     if(!identifiers.keyframes.test(rule.name) || isStamped(rule)) {
            //         return;
            //     }

            //     // Save closure ref to this rule
            //     current = rule;
                
            //     lookup = keyframes;
                
            //     rule.params = parser.processSync(rule.params);
                
            //     stamp(rule);
            // },

            // Replace animation/animation-name entries with scoped @keyframes references
            Declaration(decl) {
                if(!identifiers.animations.test(decl.prop) || isStamped(decl)) {
                    return;
                }
    
                const parsed = valueParser(decl.value);
    
                let replaced = false;
    
                parsed.walk((node) => {
                    if(node.type !== "word" || !keyframes[node.value]) {
                        return;
                    }
    
                    replaced = true;
    
                    node.value = keyframes[node.value];
                });
    
                if(!replaced) {
                    return;
                }
    
                decl.value = parsed.toString();
                
                stamp(decl);
            },
        };
    },
});

module.exports.postcss = true;
