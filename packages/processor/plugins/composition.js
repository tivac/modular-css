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

    Object.entries(refs).forEach(([ selector, composed ]) => graph.addNode(selector, {
        source : "local",
        selector,
        composed,
    }));

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

            const data = {
                selector : name,
                source   : "",
                composed : [],
            };

            if(global) {
                data.source = "global";
                data.composed = [ name ];
            } else if(details.source) {
                data.source = details.source;
                data.composed = opts.files[details.source].exports[name];
            } else if(refs[scoped]) {
                data.source = "local";
                data.composed = [ refs[scoped] ];
            } else {
                throw decl.error("Invalid composes reference", {
                    word : name,
                });
            }

            graph.addNode(scoped, data);

            selectors.forEach((parts) =>
                parts.forEach((part) =>
                    graph.addDependency(map[part], scoped)
                )
            );
        });

        const next = decl.next();

        // Remove just the composes declaration if there are other declarations
        if(next) {
            next.raws.before = decl.raw("before");

            return decl.remove();
        }

        // Remove the entire rule because it only contained the composes declaration
        return decl.parent.remove();
    });

    // Update out by walking dep graph and updating classes
    graph.overallOrder().forEach((selector) => {
        graph.dependenciesOf(selector)
            .reverse()
            .forEach((dep) => {
                const { composed } = graph.getNodeData(dep);

                out[selector] = [ ...composed, ...out[selector] ];
            });
    });

    result.messages.push({
        type    : "modular-css",
        plugin,
        graph,
        classes : mapvalues(out, (val) => {
            const classes = new Set(val);

            return [ ...classes ];
        }),
    });
};

module.exports.postcssPlugin = plugin;
