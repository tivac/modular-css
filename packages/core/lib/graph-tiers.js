"use strict";

var fs = require("fs"),

    Graph  = require("dependency-graph").DepGraph;

function copy(graph, clone, nodes, edges) {
    Object.keys(graph[edges]).forEach((node) => {
        clone[edges][node] = graph[edges][node].filter((edge) => nodes.indexOf(edge) !== -1);
    });
}

function cloner(graph) {
    var clone   = new Graph(),
        missing = 0,
        nodes   = {};

    // Unique the list of nodes by using their inode value as a key in an object
    Object.keys(graph.nodes).forEach((node) => {
        var stat, key;
        
        try {
            stat = fs.lstatSync(node);
            
            // Can't just use stat.ino, see https://github.com/tivac/modular-css/issues/242
            key = Object.keys(stat)
                .map((name) => (name !== "ctime" && name !== "mtime" ? stat[name] : false))
                .filter(Boolean)
                .join("-");
        } catch(e) {
            key = `key-${missing++}`;
        }

        if(!nodes[key]) {
            nodes[key] = node;
        }
    });

    // Turn object back into array of valid (unduplicated) nodes
    nodes = Object.keys(nodes).map((key) => nodes[key]);

    nodes.forEach((node) => clone.addNode(node));
    
    copy(graph, clone, nodes, "incomingEdges");
    copy(graph, clone, nodes, "outgoingEdges");

    return clone;
}

function leaves(graph) {
    return graph.overallOrder(true);
}

// Clone the graph and break the graph into tiers for further processing
module.exports = (graph) => {
    var clone = cloner(graph),
        tiers = [],
        tier;
        
    tier = leaves(clone);

    while(tier.length) {
        tier.forEach((node) => {
            clone.dependantsOf(node).forEach(
                (dep) => clone.removeDependency(dep, node)
            );
            
            clone.removeNode(node);
        });
        
        tiers.push(tier.sort());

        tier = leaves(clone);
    }

    return tiers.reduce((a, b) => a.concat(b), []);
};
