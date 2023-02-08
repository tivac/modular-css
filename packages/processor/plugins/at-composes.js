"use strict";

const { selectorKey } = require("@modular-css/utils/keys.js");

const parser = require("../parsers/at-composes.js");

const plugin = "modular-css-at-composes";

module.exports = () => ({
    postcssPlugin : plugin,

    prepare(result) {
        const { from, processor } = result.opts;
        const { files, graph } = processor;

        const { classes : target } = files[from];

        let source = false;

        return {
            AtRule : {
                composes(rule) {
                    if(source) {
                        throw rule.error(`Only one @composes rule per file`, { word : "composes" });
                    }

                    // We know it's safe, otherwise it would have failed in graph-nodes pass
                    const parsed = parser.parse(rule.params);
            
                    source = files[processor.resolve(from, parsed.source)];

                    // Remove the @composes from the output
                    rule.remove();

                    // Create a copy of each defined class and also the dependency graph (if it has dependencies)
                    Object.keys(source.classes).forEach((key) => {
                        target[key] = [ ...source.classes[key] ];

                        const skey = selectorKey(source.name, key);

                        if(!graph.hasNode(skey)) {
                            return;
                        }

                        const dkey = processor._addSelector(from, key);

                        // Duplicate the source key's info to the new dependent key
                        graph.dependenciesOf(skey).forEach((dep) => {
                            graph.addDependency(dkey, dep);
                        });
                    });
                },
            },
        };
    },
});

module.exports.postcss = true;
