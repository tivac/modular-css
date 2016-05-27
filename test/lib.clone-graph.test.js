"use strict";

var assert = require("assert"),
    
    Graph = require("dependency-graph").DepGraph,

    clone = require("../src/lib/clone-graph");

describe("/lib", function() {
    describe("/clone-graph.js", function() {
        it("should clone all nodes & relationships in the graph", function() {
            var graph = new Graph();
            
            graph.addNode("fooga");
            graph.addNode("booga");
            graph.addNode("wooga");
            graph.addNode("tooga");
            
            graph.addDependency("fooga", "booga");
            graph.addDependency("booga", "wooga");
            graph.addDependency("fooga", "tooga");
            
            assert.deepEqual(
                graph,
                clone(graph)
            );
        });
    });
});
