"use strict";

const Graph = require("dependency-graph").DepGraph;
const invert = require("lodash/invert");
const mapvalues = require("lodash/mapValues");

const message = require("../lib/message.js");
const identifiers = require("../lib/identifiers.js");

const parser = require("../parsers/parser.js");

const plugin = "modular-css-composition";

// Loop through all previous nodes in the container to ensure
// that composes (or a comment) comes first
function composesFirst(decl) {
    let prev;

    prev = decl.prev();

    while(prev) {
        if(prev.type !== "comment") {
            throw decl.error("composes must be the first declaration", {
                word : "composes",
            });
        }

        prev = prev.prev();
    }
}

module.exports = (css, result) => {
    const refs = message(result, "classes");
    const map = invert(refs);
    const { opts } = result;
    const graph = new Graph();
    const out = Object.assign(Object.create(null), refs);

    Object.keys(refs).forEach((key) => graph.addNode(key));

    // Go look up "composes" declarations and populate dependency graph
    css.walkDecls("composes", (decl) => {
        /* eslint max-statements: "off" */
        const details = parser.parse(decl.value);
        const selectors = decl.parent.selectors.map(identifiers.parse);

        composesFirst(decl);

        // https://github.com/tivac/modular-css/issues/238
        if(selectors.some((selector) => selector.length > 1)) {
            throw decl.error(
                "Only simple singular selectors may use composition", {
                    word : decl.parent.selector,
                }
            );
        }

        if(details.source) {
            details.source = opts.resolve(opts.from, details.source);
        }

        // Add references and update graph
        details.refs.forEach((ref) => {
            let scoped;

            if(ref.global) {
                scoped = `global-${ref.name}`;
            } else {
                scoped = (details.source ? `${details.source}-` : "") + ref.name;
            }

            graph.addNode(scoped);

            selectors.forEach((parts) =>
                parts.forEach((part) =>
                    graph.addDependency(map[part], scoped)
                )
            );

            if(ref.global) {
                refs[scoped] = [ ref.name ];

                return;
            }

            if(details.source) {
                refs[scoped] = opts.files[details.source].exports[ref.name];
            }

            if(!refs[scoped]) {
                throw decl.error("Invalid composes reference", {
                    word : ref.name,
                });
            }
        });

        // Remove just the composes declaration if there are other declarations
        if(decl.parent.nodes.length > 1) {
            return decl.remove();
        }

        // Remove the entire rule because it only contained the composes declaration
        return decl.parent.remove();
    });

    // Update out by walking dep graph and updating classes
    graph.overallOrder().forEach((selector) =>
        graph.dependenciesOf(selector)
        .reverse()
        .forEach((dep) => {
            out[selector] = refs[dep].concat(out[selector]);
        })
    );

    result.messages.push({
        type    : "modular-css",
        plugin,
        classes : mapvalues(out, (val) => {
            const classes = new Set(val);

            return [ ...classes ];
        }),
    });
};

module.exports.postcssPlugin = plugin;
