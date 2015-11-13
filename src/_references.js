"use strict";

var assign = require("lodash.assign"),
    
    identifiers = require("./_identifiers");

module.exports = function references(css, result) {
    var out;
    
    result.messages.some(function(msg) {
        if(msg.plugin === "postcss-modular-css-scoping" && msg.classes) {
            out = msg.classes;
        }
        
        return out;
    });
    
    if(out) {
        // Don't want to futz w/ a different plugin's output...
        return assign({}, out);
    }
    
    // Scoping plugin hasn't run, generate ourselves
    out = {};
    
    css.walkRules(function(rule) {
        identifiers.parse(rule.selector).forEach(function(identifier) {
            out[identifier] = identifier;
        });
    });
    
    css.walkAtRules(identifiers.keyframes, function(rule) {
        identifiers.parse("@" + rule.name + " " + rule.params).forEach(function(identifier) {
            out[identifier] = identifier;
        });
    });
    
    return out;
};
