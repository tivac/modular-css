"use strict";

const Graph = require("dependency-graph").DepGraph;
const invert = require("lodash/invert");
const mapvalues = require("lodash/mapValues");

const message = require("../lib/message.js");
const identifiers = require("../lib/identifiers.js");

const parser = require("../parsers/composes.js");

const plugin = "modular-css-composition";

module.exports = (css, result) => {
    const { opts } = result;
    
    const refs = {
        ...message(result, "atcomposes"),
        ...message(result, "classes"),
    };

    const map = invert(refs);
    const out = { ...refs };
    const graph = new Graph();

    Object.keys(refs).forEach((key) => graph.addNode(key));

    // Go look up "composes" declarations and populate dependency graph
    css.walkDecls("composes", (decl) => {
        /* eslint max-statements: "off" */
        const details = parser.parse(decl.value);
        const selectors = decl.parent.selectors.map(identifiers.parse);

        // https://github.com/tivac/modular-css/issues/238
        if(selectors.some(({ length }) => length > 1)) {
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
        details.refs.forEach(({ global, name }) => {
            let scoped;

            if(global) {
                scoped = `global-${name}`;
            } else {
                scoped = (details.source ? `${details.source}-` : "") + name;
            }

            graph.addNode(scoped);

            selectors.forEach((parts) =>
                parts.forEach((part) =>
                    graph.addDependency(map[part], scoped)
                )
            );

            if(global) {
                refs[scoped] = [ name ];

                return;
            }

            if(details.source) {
                refs[scoped] = opts.files[details.source].exports[name];
            }

            if(!refs[scoped]) {
                throw decl.error("Invalid composes reference", {
                    word : name,
                });
            }
        });

        // Remove just the composes declaration if there are other declarations
        if(decl.parent.nodes.length > 1) {
            // If there's nodes after this one adjust their positioning
            // so it's like the composes was never there
            const next = decl.next();
        
            if(next) {
                next.raws.before = decl.raw("before");
            }

            return decl.remove();
        }

        // Remove the entire rule because it only contained the composes declaration
        return decl.parent.remove();
    });

    // Update out by walking dep graph and updating classes
    // graph.overallOrder().forEach((selector) =>
    //     graph.dependenciesOf(selector)
    //         .reverse()
    //         .forEach((dep) => {
    //             out[selector] = refs[dep].concat(out[selector]);
    //         })
    // );

    result.messages.push({
        type : "modular-css",
        plugin,

        classes : out,
        // mapvalues(out, (val) => {
        //     const classes = new Set(val);

        //     return [ ...classes ];
        // }),
    });
};

module.exports.postcssPlugin = plugin;
