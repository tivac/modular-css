"use strict";

const selectorParser = require("postcss-selector-parser");
const valueParser = require("postcss-value-parser");

const identifiers = require("../lib/identifiers.js");

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
        const rewritten = new Set();
        const classes = new Map();
        const keyframes = new Map();
        const globals = new Set();
        
        let current;
        let lookup;

        const { exportGlobals, namer, from } = result.opts;
        
        const parser = selectorParser((selectors) => {
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
                node.replaceWith(selectorParser.selector({
                    nodes  : node.nodes,
                    source : node.source,
                }));
    
                node.walk((child) => {
                    const key = rename(current, child);
    
                    if(!key) {
                        return;
                    }
    
                    // Don't allow local/global overlap (but globals can overlap each other nbd)
                    if(lookup.has(key) && !globals.has(key)) {
                        throw current.error(reuse, { word : key });
                    }
    
                    globals.add(key);
                    
                    if(exportGlobals !== false) {
                        lookup.set(key, [ child.value ]);
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
                if(globals.has(key)) {
                    throw current.error(reuse, { word : key });
                }
    
                node.value = namer(from, node.value);
    
                lookup.set(key, [ node.value ]);
    
                return;
            });
        });

        return {
            // Walk all rules and save off rewritten selectors
            Rule(rule) {
                // Don't re-scope rules
                if(rewritten.has(rule.selector)) {
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
                
                rewritten.add(rule.selector);
            },
    
            // Also scope @keyframes rules so they don't leak globally
            AtRule(rule) {
                // Don't re-scope rules, and only care about @keyframes or prefixed variations
                if(!identifiers.keyframes.test(rule.name) || rewritten.has(rule.params)) {
                    return;
                }

                // Save closure ref to this rule
                current = rule;
                
                lookup = keyframes;
                
                rule.params = parser.processSync(rule.params);
                
                rewritten.add(rule.params);
            },

            Declaration(decl) {
                if(!identifiers.animations.test(decl.prop) || rewritten.has(decl.value)) {
                    return;
                }
    
                const parsed = valueParser(decl.value);
    
                let replaced = false;
    
                parsed.walk((node) => {
                    if(node.type !== "word" || !keyframes.has(node.value)) {
                        return;
                    }
    
                    replaced = true;
    
                    node.value = keyframes.get(node.value);
                });
    
                if(!replaced) {
                    return;
                }
    
                decl.value = parsed.toString();
                
                rewritten.add(decl.value);
            },

            OnceExit() {
                // TODO: can't push these at the end, has to happen in real time
                // TODO: but to where?
                if(classes.size) {
                    result.messages.push({
                        type    : "modular-css",
                        plugin,
                        classes : Object.fromEntries(classes),
                    });
                }
            },
        };
    },
});

module.exports.postcss = true;
