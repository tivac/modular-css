"use strict";

const leaves = (graph) => graph.overallOrder(true);

// Clone the graph and break the graph into tiers for further processing
module.exports = (graph) => {
    const clone = graph.clone();
    const tiers = [];
    
    let tier = leaves(clone);

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
