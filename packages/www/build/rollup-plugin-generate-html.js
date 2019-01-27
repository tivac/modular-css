"use strict";

const fs = require("fs");
const path = require("path");

const Graph = require("dependency-graph").DepGraph;
const shell = require("shelljs");

const repl = require("./html/repl.js");
const guide = require("./html/guide.js");
const home = require("./html/home.js");

module.exports = ({ bundle : previous }) => ({
    name : "rollup-plugin-generate-html",

    async writeBundle(bundle) {
        const graph = new Graph();

        Object.entries(bundle).forEach(([ entry, { isAsset, imports }]) => {
            if(isAsset) {
                return;
            }

            graph.addNode(entry, 0);

            imports.forEach((dep) => {
                graph.addNode(dep);
                graph.addDependency(entry, dep);
            });
        });

        const args = { bundle, graph, previous };

        [
            repl(args),
            guide(args),
            home(args),
        ].forEach(({ file, html }) => {
            const dir = path.dirname(file);

            shell.mkdir("-p", dir);

            fs.writeFileSync(file, html, "utf8");
        });
    },
});
