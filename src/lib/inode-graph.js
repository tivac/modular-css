"use strict";

var fs   = require("fs"),
    path = require("path"),

    Graph = require("dependency-graph").DepGraph,
    proto = Graph.prototype,

    _lookup = new Map();

function lookup(name) {
    var full = path.resolve(name),
        stats;
    
    if(_lookup.has(full)) {
        return _lookup.get(full);
    }

    stats = fs.lstatSync(full);

    _lookup.set(full, stats.ino);

    return stats.ino;
}

function InodeGraph() {
    Graph.call(this);
}

InodeGraph.prototype = Object.create(proto);
InodeGraph.prototype.constructor = InodeGraph;

InodeGraph.prototype.addNode = function(name) {
    proto.addNode.call(this, lookup(name), name);
};

InodeGraph.prototype.remove = function(name) {
    return proto.removeNode.call(this, lookup(name));
};

InodeGraph.prototype.has = function(name) {
    return proto.hasNode.call(this, lookup(name));
};

InodeGraph.prototype.addDependency = function(a, b) {
    proto.addDependency.call(this, lookup(a), lookup(b));
};
    
InodeGraph.prototype.removeDependency = function(a, b) {
    return proto.removeDependency.call(this, lookup(a), lookup(b));
};

InodeGraph.prototype.dependenciesOf = function(name, leaves) {
    return proto.dependenciesOf.call(this, lookup(name), leaves).map((n) =>
        proto.getNodeData.call(this, n)
    );
};

InodeGraph.prototype.dependantsOf = function(name, leaves) {
    return proto.dependantsOf.call(this, lookup(name), leaves).map((n) =>
        proto.getNodeData.call(this, n)
    );
};

InodeGraph.prototype.overallOrder = function(leaves) {
    return proto.overallOrder.call(this, leaves).map((n) =>
        proto.getNodeData.call(this, n)
    );
};

module.exports = InodeGraph;
