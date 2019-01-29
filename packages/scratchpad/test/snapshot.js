"use strict";

const { toMatchSnapshot } = require("jest-snapshot");

expect.extend({
    toMatchChunksSnapshot(graph, ...args) {
        const nodes = graph.overallOrder();

        return toMatchSnapshot.call(
            this,
            nodes.map((node) => ({
                node,
                nodes : graph.getNodeData(node),
            })),
            ...args,
        );
    }
});
