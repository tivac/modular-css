"use strict";

var fs = require("fs"),

    Graph = require("dependency-graph").DepGraph,
    
    _lookup = new Map();

function lookup(name) {
    if(_lookup.has(name)) {
        return _lookup.get(name);
    }

    // TODO: take name & get inode, add mapping
}

function InodeGraph() {
    Graph.call(this);
}

InodeGraph.prototype = Object.create(Graph.prototype);
InodeGraph.prototype.constructor = InodeGraph;

InodeGraph.prototype.add = function(name, deps) {
    var key = lookup(name);
    
    Graph.addNode.call(this, key, name);

    if(Array.isArray(deps)) {
        deps.forEach((d) => Graph.addDependency.call(this, key, lookup(d)));
    }
};
    
InodeGraph.prototype.remove = function(name) {
    return Graph.removeNode.call(this, lookup(name));
};

InodeGraph.prototype.has = function(name) {
    return Graph.hasNode.call(this, lookup(name));
};

InodeGraph.prototype.removeDependency = function(a, b) {
    return Graph.removeDependency.call(this, lookup(a), lookup(b));
};

InodeGraph.prototype.dependenciesOf = function(name, leaves) {
    return Graph.dependenciesOf.call(this, lookup(name), leaves).map((n) => Graph.getNodeData.call(this, lookup(n)));
};

InodeGraph.prototype.dependantsOf = function(name, leaves) {
    return Graph.dependantsOf.call(this, lookup(name), leaves).map((n) => Graph.getNodeData.call(this, lookup(n)));
};

InodeGraph.prototype.overallOrder = function(leaves) {
    return Graph.overallOrder.call(this, leaves).map((n) => Graph.getNodeData.call(this, lookup(n)));
};

module.exports = InodeGraph;
