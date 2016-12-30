"use strict";

var path   = require("path"),
    assert = require("assert"),

    Graph   = require("dependency-graph").DepGraph,
    
    plugin = require("../src/plugins/graph-nodes.js"),
    
    processor = require("./lib/postcss.js")([ plugin ]);

describe("/plugins", function() {
    describe("/graph-nodes.js", function() {
        var from = path.resolve("./test/specimens/simple.css");

        it("should populate a graph with external @value references", function() {
            var graph = new Graph();

            graph.addNode(from);
            
            return processor.process(
                `@value one from "./local.css";`,
                { from, graph }
            )
            .then(() => assert.deepEqual(graph.overallOrder(), [
                path.resolve("./test/specimens/local.css"),
                from
            ]));
        });

        it("should populate a graph with external composes references", function() {
            var graph = new Graph();

            graph.addNode(from);
            
            return processor.process(
                `.a { composes: booga from "./local.css"; }`,
                { from, graph }
            )
            .then(() => assert.deepEqual(graph.overallOrder(), [
                path.resolve("./test/specimens/local.css"),
                from
            ]));
        });

        it("should populate a graph with :external references", function() {
            var graph = new Graph();

            graph.addNode(from);
            
            return processor.process(
                `.a :external(booga from "./local.css") { color: red; }`,
                { from, graph }
            )
            .then(() => assert.deepEqual(graph.overallOrder(), [
                path.resolve("./test/specimens/local.css"),
                from
            ]));
        });

        it("should return useful errors when parsing", function() {
            var graph = new Graph();

            graph.addNode(from);
            
            return processor.process(
                `@value sm, md, lg "../../shared.css";`,
                { from, graph }
            )
            .catch((e) => assert(e.message.indexOf(`SyntaxError: Expected "from"`) > -1));
        });
    });
});
