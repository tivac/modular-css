"use strict";

var resolve = require("../lib/resolve.js"),
    parser  = require("./composition.parser.js");

function process(file, input, thing, word) {
    var parsed;

    try {
         parsed = parser.parse(input);
    } catch(e) {
        throw thing.error(`Unable to parse composition: ${e.toString()}`, { word : word });
    }
    
    if(parsed.source) {
        parsed.source = resolve(file, parsed.source);
    }
    
    return parsed;
}

exports.parse = parser.parse;

exports.decl = function(file, decl) {
    if(decl.prev() && decl.prev().prop !== "composes") {
        throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
    }
    
    return process(file, decl.value.trim(), decl, decl.value);
};

exports.rule = function(file, rule) {
    return process(file, rule.params.trim(), rule, rule.params);
};
