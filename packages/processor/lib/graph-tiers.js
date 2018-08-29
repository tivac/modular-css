"use strict";

var fs = require("fs");

function uniqueGraph(graph) {
    var clone   = graph.clone(),
        missing = 0,
        nodes   = {};

    // Unique the list of nodes by using their inode value as a key in an object
    graph.overallOrder().forEach((node) => {
        var stat, key;
        
        try {
            stat = fs.lstatSync(node);
            
            // Can't just use stat.ino, see https://github.com/tivac/modular-css/issues/242
            key = Object.keys(stat)
                .map((name) => (name !== "ctime" && name !== "mtime" ? stat[name] : false))
                .filter(Boolean)
                .join("-");
        } catch(e) {
            key = `key-${missing++}`;
        }

        if(key in nodes) {
            clone.removeNode(node);
        }

        nodes[key] = true;
    });

    return clone;
}

function leaves(graph) {
    return graph.overallOrder(true);
}

// Clone the graph and break the graph into tiers for further processing
module.exports = (graph) => {
    var clone = uniqueGraph(graph),
        tiers = [],
        tier;
        
    tier = leaves(clone);

    while(tier.length) {
        tier.forEach((node) => {
            clone.dependantsOf(node).forEach(
                (dep) => clone.removeDependency(dep, node)
            );
            
            clone.removeNode(node);
        });
        
        tiers.push(tier.sort());

        tier = leaves(clone);
    }

    return tiers.reduce((a, b) => a.concat(b), []);
};
