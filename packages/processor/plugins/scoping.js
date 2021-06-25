"use strict";

const processor = require("postcss-selector-parser");

const identifiers = require("../lib/identifiers.js");

const STAMP = Symbol("Scoped");

const reuse  = "Unable to re-use the same selector for global & local";
const plugin = "modular-css-scoping";

const stamp = (obj) => Object.defineProperty(obj, STAMP, { value : true });

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

    prepare({ opts, messages }) {
        const classes   = Object.create(null);
        const keyframes = Object.create(null);
        const globals   = Object.create(null);
        
        let current;
        let lookup;

        const { exportGlobals, namer, from } = opts;
        
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
                    
                    if(exportGlobals !== false) {
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
    
                node.value = namer(from, node.value);
    
                lookup[key] = [ node.value ];
    
                return;
            });
        });

        return {
            // Walk all rules and save off rewritten selectors
            Rule(rule) {
                // Don't re-scope rules
                if(rule[STAMP]) {
                    return;
                }

                // Don't process the children of @keyframes, they don't need scoping
                if(rule.parent.type === "atrule" && rule.parent.name === "keyframes") {
                    return;
                }

                stamp(rule);
                
                // Save closure ref to this rule
                current = rule;
                lookup = classes;
    
                rule.selector = parser.processSync(rule);
            },
    
            // Also scope @keyframes rules so they don't leak globally
            AtRule : {
                keyframes(rule) {
                    // Don't re-scope rules
                    if(rule[STAMP]) {
                        return;
                    }

                    stamp(rule);

                    // Save closure ref to this rule
                    current = rule;
    
                    lookup = keyframes;
    
                    rule.params = parser.processSync(rule.params);
                },
            },

            // TODO: can't push these at the end, has to happen in real time
            OnceExit() {
                console.log("onceExit");

                if(Object.keys(keyframes).length) {
                    messages.push({
                        type : "modular-css",
                        plugin,
                        keyframes,
                    });
                }
            
                if(Object.keys(classes).length) {
                    messages.push({
                        type : "modular-css",
                        plugin,
                        classes,
                    });
                }
            },
        };
    },
});

module.exports.postcss = true;
