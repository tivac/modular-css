"use strict";

var fs = require("fs"),

    Graph  = require("dependency-graph").DepGraph;

function copy(graph, clone, nodes, edges) {
    Object.keys(graph[edges]).forEach((node) => {
        clone[edges][node] = graph[edges][node].filter((edge) => nodes.indexOf(edge) !== -1);
    });
}

module.exports = function(graph) {
    var clone   = new Graph(),
        missing = 0,
        nodes   = {};


    // Unique the list of nodes by using their inode value as a key in an object
    Object.keys(graph.nodes).forEach((node) => {
        var inode;
        
        try {
            inode = fs.lstatSync(node).ino;
        } catch(e) {
            inode = missing++;
        }

        if(!nodes[`inode-${inode}`]) {
            nodes[`inode-${inode}`] = node;
        }
    });

    // Turn object back into array of valid (unduplicated) nodes
    nodes = Object.keys(nodes).map((key) => nodes[key]);

    nodes.forEach((node) => clone.addNode(node));
    
    copy(graph, clone, nodes, "incomingEdges");
    copy(graph, clone, nodes, "outgoingEdges");

    return clone;
};
