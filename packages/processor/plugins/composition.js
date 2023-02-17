"use strict";

const relative = require("@modular-css/utils/relative.js");
const { selectorKey } = require("@modular-css/utils/keys.js");
const identifiers = require("@modular-css/utils/identifiers.js");

const parser = require("../parsers/composes.js");

const plugin = "modular-css-composition";

module.exports = () => ({
    postcssPlugin : plugin,

    prepare(result) {
        const { from, processor } = result.opts;
        const { files, graph } = processor;
        const available = files[from].classes;
        
        return {
            Declaration : {
                // Go look up "composes" declarations and update dependency graph
                composes(decl) {
                    const { parent, value } = decl;
        
                    // Map of scoped classnames to the originals
                    const selectorMap = new Map();
        
                    Object.keys(available).forEach((src) =>
                        available[src].forEach((scoped) =>
                            selectorMap.set(scoped, src)
                        )
                    );
        
                    const selectors = parent.selectors.map(identifiers.parse);
        
                    // https://github.com/tivac/modular-css/issues/238
                    if(selectors.some(({ length }) => length > 1)) {
                        throw decl.error(
                            "Only simple singular selectors may use composition", {
                                word : parent.selector,
                            }
                        );
                    }
        
                    const details = parser.parse(value);
        
                    if(details.source) {
                        details.source = processor.resolve(from, details.source);
                    }
        
                    details.refs.forEach(({ global, name }) => {
                        let ref;
        
                        if(details.source) {
                            // External refs should already exist, so they don't get added
                            ref = selectorKey(details.source, name);
                        } else if(global) {
                            ref = processor._addGlobal(name);
                        } else {
                            // Internal refs are created if necessary here
                            ref = processor._addSelector(from, name);
        
                            if(!available[name]) {
                                const rel = relative(processor.options.cwd, from);
        
                                throw decl.error(
                                    `Invalid composes reference, .${name} does not exist in ${rel}`, {
                                        word : name,
                                    }
                                );
                            }
                        }
        
                        // Update graph with all the dependency information
                        selectors.forEach((parts) =>
                            parts.forEach((part) => {
                                const src = processor._addSelector(from, selectorMap.get(part));
        
                                graph.addDependency(src, ref);
                            })
                        );
                    });
        
                    // Remove just the composes declaration if there are other declarations
                    if(parent.nodes.length > 1) {
                        // If there's nodes after this one adjust their positioning
                        // so it's like the composes was never there
                        const next = decl.next();
        
                        if(next) {
                            next.raws.before = decl.raw("before");
                        }
        
                        return decl.remove();
                    }
        
                    // Remove the entire rule because it only contained the composes declaration
                    return parent.remove();
                },
            },
        };
    },
});

module.exports.postcss = true;
