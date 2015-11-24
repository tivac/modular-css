// TODO: rename to _composes.js
"use strict";

var path = require("path"),
    
    resolve  = require("resolve-from"),
    values   = require("postcss-value-parser"),
    selector = require("postcss-selector-parser"),
    
    relative = require("./_relative"),

    check = {
        comma : function(node) {
            return node.type === "div" && node.value === ",";
        },

        space : function(node) {
            return node.type === "space";
        },

        from : function(node) {
            return node.type === "word" && node.value === "from";
        },

        source : function(node) {
            return node.type === "string";
        },

        identifier : function(node) {
            var ok;

            if(node.type !== "word" || node.value === "from") {
                return false;
            }

            selector(function(ast) {
                ok = ast.nodes.length === 1 && ast.first.nodes.length === 1;
            }).process(node.value);

            return ok;
        },

        global : function(node) {
            return node.type === "function" &&
                   node.value === "global" &&
                   node.nodes.length === 1 &&
                   check.identifier(node.nodes[0]);
        }
    },
    types = Object.keys(check);

module.exports = function parse(file, input) {
    /* eslint complexity:[2, 16], no-loop-func:0 */
    var out = {
            rules  : [],
            types  : {},
            source : false
        },
        state = {
            // Parse phases
            source : false,
            rules  : true,
            
            // Metadata
            type : false,
            prev : false,
            pos  : 0
        },
        nodes, node;

    nodes = typeof input === "string" ? values(input.trim()).nodes : input;

    for(state.pos = 0; state.pos < nodes.length; state.pos++) {
        node = nodes[state.pos];
        state.prev = state.type;
        state.type = false;

        types.some(function(name) {
            if(check[name](node)) {
                state.type = name;
            }

            return state.type;
        });

        if(state.rules) {
            if(state.type === "identifier") {
                out.types[node.value] = "local";
                out.rules .push(node.value);
                continue;
            }

            if(state.type === "global") {
                out.types[node.nodes[0].value] = "global";
                out.rules .push(node.nodes[0].value);
                continue;
            }

            if(state.type === "comma" && (state.prev === "identifier" || state.prev === "global")) {
                continue;
            }

            if(state.type === "space" && (state.prev === "identifier" || state.prev === "global")) {
                state.rules = false;
                state.source = true;
                continue;
            }

            // Unknown node for this state, abort
            break;
        }

        // Must be in state "source" then
        if(state.type === "from" && state.prev === "space") {
            continue;
        }

        if(state.type === "space") {
            continue;
        }

        if(state.type === "source" && state.prev === "space") {
            out.source = relative(resolve(path.dirname(file), node.value));
            continue;
        }

        // Unknown node for this state, abort
        break;
    }

    // Ensure that we consumed all available nodes and that the last node
    // consumed was of an acceptable type
    if(nodes.length &&
       state.pos === nodes.length &&
       (state.type === "identifier" ||
       state.type === "global" ||
       state.type === "source")) {
        return out;
    }

    return false;
};
