"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("postcss"),
    Graph   = require("dependency-graph").DepGraph,
    
    plugin  = require("../src/plugins/graph-nodes.js"),
    resolve = require("../src/lib/resolve.js"),
    
    processor = require("postcss")([ plugin ]);

describe("/plugins", function() {
    describe("/graph-nodes.js", function() {
        it("should populate a graph with external @value references", () => {
            var graph = new Graph(),
                from  = path.resolve("./test/specimens/simple.css");

            graph.addNode(from);
            
            return processor.process(
                `@value one from "./local.css";`,
                { from, graph, resolve }
            )
            .then(() => assert.deepEqual(graph.overallOrder(), [
                path.resolve("./test/specimens/local.css"),
                from
            ]));
        });

        it("should populate a graph with external composes references", () => {
            var graph = new Graph(),
                from  = path.resolve("./test/specimens/simple.css");

            graph.addNode(from);
            
            return processor.process(
                `.a { composes: booga from "./local.css"; }`,
                { from, graph, resolve }
            )
            .then(() => assert.deepEqual(graph.overallOrder(), [
                path.resolve("./test/specimens/local.css"),
                from
            ]));
        });

        it("should populate a graph with :external references", () => {
            var graph = new Graph(),
                from  = path.resolve("./test/specimens/simple.css");

            graph.addNode(from);
            
            return processor.process(
                `.a :external(booga from "./local.css") { color: red; }`,
                { from, graph, resolve }
            )
            .then(() => assert.deepEqual(graph.overallOrder(), [
                path.resolve("./test/specimens/local.css"),
                from
            ]));
        });

        it("should return useful errors when parsing", () => {
            var graph = new Graph(),
                from  = path.resolve("./test/specimens/simple.css");

            graph.addNode(from);
            
            return processor.process(
                `@value sm, md, lg "../../shared.css";`,
                { from, graph, resolve }
            )
            .catch((e) => assert(e.message.indexOf(`SyntaxError: Expected "from"`) > -1));
        });
    });
});
