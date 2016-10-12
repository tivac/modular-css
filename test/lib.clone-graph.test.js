"use strict";

var assert = require("assert"),
    
    Graph = require("dependency-graph").DepGraph,

    clone = require("../src/lib/clone-graph");

describe("/lib", () => {
    describe("/clone-graph.js", () => {
        it("should clone all nodes & relationships in the graph", () => {
            var graph = new Graph();
            
            graph.addNode("A");
            graph.addNode("B");
            graph.addNode("C");
            graph.addNode("D");
            
            graph.addDependency("A", "B");
            graph.addDependency("B", "C");
            graph.addDependency("A", "D");
            
            assert.deepEqual(
                graph,
                clone(graph)
            );
        });
    });
});
