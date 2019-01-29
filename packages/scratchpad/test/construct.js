"use strict";

const dedent = require("dedent");
const { DepGraph } = require("dependency-graph");

const construct = (entries, tmpl) => {
    const graph = new DepGraph();

    const rows = dedent(tmpl).split(/\r?\n/);

    rows.forEach((row) => {
        const [ src, tgt ] = row.trim().split(/\s*->\s*/);
        
        if(entries.indexOf(src) > -1) {
            graph.addNode(src, null);
        } else {
            graph.addNode(src, [ src ]);
        }
        
        if(entries.indexOf(tgt) > -1) {
            graph.addNode(tgt, null);
        } else {
            graph.addNode(tgt, [ tgt ]);
        }

        graph.addDependency(src, tgt);
    });

    return {
        entries,
        graph,
    };
};

module.exports = construct;
