"use strict";

var Graph   = require("dependency-graph").DepGraph,
    
    plugin   = require("../plugins/graph-nodes.js"),
    resolver = require("../lib/resolve.js").resolve,
    relative = require("../lib/relative.js"),
    
    processor = require("postcss")([ plugin ]);
    
function resolve(src, file) {
    return relative(process.cwd(), resolver(src, file));
}

describe("/plugins", function() {
    describe("/graph-nodes.js", function() {
        it("should populate a graph with external @value references", () => {
            var graph = new Graph(),
                from  = "packages/core/test/specimens/simple.css";

            graph.addNode(from);
            
            return processor.process(
                `@value one from "./local.css";`,
                { from, graph, resolve }
            )
            .then(() => expect(graph.overallOrder()).toMatchSnapshot());
        });

        it("should populate a graph with external composes references", () => {
            var graph = new Graph(),
                from  = "packages/core/test/specimens/simple.css";

            graph.addNode(from);
            
            return processor.process(
                `.a { composes: booga from "./local.css"; }`,
                { from, graph, resolve }
            )
            .then(() => expect(graph.overallOrder()).toMatchSnapshot());
        });

        it("should populate a graph with :external references", () => {
            var graph = new Graph(),
                from  = "packages/core/test/specimens/simple.css";

            graph.addNode(from);
            
            return processor.process(
                `.a :external(booga from "./local.css") { color: red; }`,
                { from, graph, resolve }
            )
            .then(() => expect(graph.overallOrder()).toMatchSnapshot());
        });

        it("should return useful errors when parsing", () => {
            var graph = new Graph(),
                from  = "packages/core/test/specimens/simple.css";

            graph.addNode(from);
            
            return processor.process(
                `@value sm, md, lg "../../shared.css";`,
                { from, graph, resolve }
            )
            .catch((e) => expect(e.message).toMatch(`SyntaxError: Expected "from"`));
        });
    });
});
