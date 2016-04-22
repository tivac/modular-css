"use strict";

var Graph = require("dependency-graph").DepGraph;

module.exports = function(graph) {
    var clone = new Graph();
    
    graph.overallOrder().forEach(function(node) {
        clone.addNode(node);
        
        graph.dependenciesOf(node).forEach(function(dep) {
            clone.addDependency(node, dep);
        });
    });
    
    return clone;
};
