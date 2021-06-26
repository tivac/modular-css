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

    prepare(result) {
        const classes = new Map();
        const keyframes = new Map();
        const globals = new Set();
        const animations = new Set();
        
        let current;
        let lookup;

        const { exportGlobals, namer, from } = result.opts;
        
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

        const animDecl = (decl) => {
            // Don't re-scope
            if(decl[STAMP]) {
                return;
            }

            stamp(decl);

            animations.add(decl);
        };

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
            AtRule(rule) {
                // Don't re-scope rules, and only care about @keyframes or prefixed variations
                if(rule[STAMP] || !identifiers.keyframes.test(rule.name)) {
                    return;
                }

                stamp(rule);

                // Save closure ref to this rule
                current = rule;

                lookup = keyframes;

                rule.params = parser.processSync(rule.params);
            },

            Declaration : {
                animation        : animDecl,
                "animation-name" : animDecl,
            },

            OnceExit() {
                const search = new RegExp(
                    [ ...keyframes.keys() ]
                    .map((ref) => `(\\b${escape(ref)}\\b)`)
                    .join("|"),
                    "g"
                );

                animations.forEach((decl) => {
                    if(keyframes.size) {
                        // TODO: Should this use a value parser instead?
                        decl.value = decl.value.replace(search, (match) => keyframes.get(match));
                    } else {
                        result.warn(`${decl.prop} declaration w/o a matching @keyframes rule`, {
                            node : decl,
                            word : decl.value,
                        });
                    }

                    animations.delete(decl);
                });

                // TODO: can't push these at the end, has to happen in real time
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
