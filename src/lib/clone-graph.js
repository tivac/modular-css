"use strict";

var Graph = require("dependency-graph").DepGraph;

module.exports = function(graph) {
    var clone = new Graph();
    
    graph.overallOrder().forEach(function(node) {
        clone.addNode(node);
    });
    
    Object.keys(graph.incomingEdges).forEach(function(node) {
        clone.incomingEdges[node] = graph.incomingEdges[node].slice();
    });
    
    Object.keys(graph.outgoingEdges).forEach(function(node) {
        clone.outgoingEdges[node] = graph.outgoingEdges[node].slice();
    });
    
    return clone;
};
