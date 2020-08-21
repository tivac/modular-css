"use strict";

const parser = require("../parsers/at-composes.js");

const {
    selectorKey,
    fileKey,
} = require("../lib/keys.js");

const plugin = "modular-css-at-composes";

module.exports = (css, { opts, messages }) => {
    const { from, processor } = opts;
    const { files, graph } = processor;
        
    let source;

    css.walkAtRules("composes", (rule) => {
        if(source) {
            throw rule.error(`Only one @composes rule per file`, { word : "composes" });
        }

        // We know it's safe, otherwise it would have failed in graph-nodes pass
        const parsed = parser.parse(rule.params);

        source = files[processor.resolve(from, parsed.source)];

        // Remove the @composes from the output
        rule.remove();
    });

    if(!source) {
        return;
    }

    const fkey = fileKey(from);

    // Create a copy of each defined class and also the dependency graph
    const atcomposes = Object.keys(source.classes).reduce((acc, key) => {
        acc[key] = [ ...source.classes[key] ];

        source.classes[key].forEach((selector) => {
            const skey = selectorKey(source.name, selector);
            const dkey = processor._addSelector(from, selector);

            graph.addDependency(dkey, fkey);

            graph.dependenciesOf(skey).forEach((dep) => {
                graph.addDependency(dkey, dep);
            });
        });

        return acc;
    }, Object.create(null));

    messages.push({
        type : "modular-css",
        plugin,

        atcomposes,
    });
};

module.exports.postcssPlugin = plugin;
