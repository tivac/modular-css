/* eslint-disable no-loop-func */
"use strict";

const merge = (graph, original, target) => {
    const incoming = graph.incomingEdges[original];
    const outgoing = graph.outgoingEdges[original];

    // Add original file reference to target array
    graph.getNodeData(target).unshift(original);

    // Copy all incoming dependencies from original to target
    incoming.forEach((src) => {
        if(src === target) {
            return;
        }

        graph.addDependency(src, target);
    });

    // Copy all outgoing dependencies from original to target
    outgoing.forEach((dest) => {
        if(dest === target) {
            return;
        }

        graph.addDependency(target, dest);
    });

    // Bye bye
    graph.removeNode(original);
};

const setsContain = (a, b) => {
    for(const val of a) {
        if(!b.has(val)) {
            return false;
        }
    }

    return true;
};

const setsMatch = (a, b) => {
    if(a.size !== b.size) {
        return false;
    }

    return setsContain(a, b);
};

const chunks = ({ entries, graph }) => {
    const result = graph.clone();

    // Lookups
    const nodeToEntries = new Map();
    const entryToNodes = new Map();

    // Keeping track of nodes we've already handled
    const chunked = new Set();

    // First build up a map of entry -> set of deps for comparisons
    entries.forEach((entry) => {
        const deps = result.dependenciesOf(entry).reverse();

        if(!entryToNodes.has(entry)) {
            entryToNodes.set(entry, new Set());
        }

        deps.forEach((node) => {
            if(!nodeToEntries.has(node)) {
                nodeToEntries.set(node, new Set());
            }

            nodeToEntries.get(node).add(entry);
            entryToNodes.get(entry).add(node);
        });
    });

    // Keep looping until all nodes have been chunked (even if that's just into themselves)
    while(chunked.size < nodeToEntries.size) {
        // Iterate the nodes associated with each entry,
        // and figure out if the node can be collapsed
        entryToNodes.forEach((nodes) => {
            // Nodes that will be merged at the end of this iteration
            const queued = new Set();

            // If all the nodes for this branch are handled, skip it
            if(setsContain(nodes, chunked)) {
                return;
            }

            // This will be the first set of entries found in the walk,
            // any subsequent nodes in this pass must match this to be combined
            // NOTE: can't be assigned yet because the already-chunked nodes
            // need to be filtered out first
            let branches;

            // Walk the dependencies of the current entry in order
            for(const node of nodes) {
                if(chunked.has(node)) {
                    continue;
                }

                // Figure out the entries that reference this node
                const containers = nodeToEntries.get(node);

                if(!branches) {
                    branches = containers;
                }

                // If the references are identical the node can be queued to merge
                if(setsMatch(branches, containers)) {
                    queued.add(node);
                }
            }

            // Merge all the queued nodes into the first node in the queue
            let base;

            queued.forEach((node) => {
                chunked.add(node);

                if(!base) {
                    base = node;

                    return;
                }

                merge(result, node, base);
            });
        });
    }

    return result;
};

module.exports = chunks;
