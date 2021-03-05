"use strict";

const parser = require("../parsers/at-composes.js");

const { selectorKey } = require("../lib/keys.js");

const plugin = "modular-css-at-composes";

module.exports = () => {
    let source;

    return {
        postcssPlugin : plugin,

        Once() {
            source = false;
        },
        
        AtRule : {
            composes(rule, { result }) {
                if(source) {
                    throw rule.error(`Only one @composes rule per file`, { word : "composes" });
                }

                const { from, processor } = result.opts;
                const { files, graph } = processor;
        
                // We know it's safe, otherwise it would have failed in graph-nodes pass
                const parsed = parser.parse(rule.params);
        
                source = files[processor.resolve(from, parsed.source)];
        
                // Remove the @composes from the output
                rule.remove();

                // Create a copy of each defined class and also the dependency graph (if it has dependencies)
                const atcomposes = Object.keys(source.classes).reduce((acc, key) => {
                    acc[key] = [ ...source.classes[key] ];

                    const skey = selectorKey(source.name, key);

                    if(!graph.hasNode(skey)) {
                        return acc;
                    }

                    const dkey = processor._addSelector(from, key);

                    // Duplicate the source key's info to the new dependent key
                    graph.dependenciesOf(skey).forEach((dep) => {
                        graph.addDependency(dkey, dep);
                    });

                    return acc;
                }, Object.create(null));

                result.messages.push({
                    type : "modular-css",
                    plugin,
            
                    atcomposes,
                });
            },
        },
    };
};

module.exports.postcss = true;
