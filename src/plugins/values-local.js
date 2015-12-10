"use strict";

var parser  = require("postcss-value-parser"),

    values = require("./_values");

module.exports = values(
    "postcss-modular-css-values-local",
    function parseBase(options, rule) {
        var parts = parser(rule.params).nodes,
            out   = {};
            
        if(parts.length < 2) {
            return false;
        }

        if(parts[0].type === "word" && parts[1].type === "div" && parts[1].value === ":") {
            out[parts[0].value] = parser.stringify(parts.slice(2));

            return out;
        }

        return false;
    }
);
