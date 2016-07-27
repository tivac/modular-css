"use strict";

var values   = require("postcss-value-parser"),
    selector = require("postcss-selector-parser"),
    
    resolve = require("./resolve"),
    
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
            return node.type === "string" ||
                   (node.type === "word" &&
                   node.value === "super");
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

function parse(input) {
    /* eslint max-statements:["error", 34], no-loop-func:0 */
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
    
    nodes = values(input.trim()).nodes;

    for(state.pos = 0; state.pos < nodes.length; state.pos++) {
        node       = nodes[state.pos];
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
                out.rules.push(node.value);
                continue;
            }

            if(state.type === "global") {
                out.types[node.nodes[0].value] = "global";
                out.rules.push(node.nodes[0].value);
                continue;
            }

            if(state.type === "comma" && (state.prev === "identifier" || state.prev === "global")) {
                continue;
            }

            if(state.type === "space" && (state.prev === "identifier" || state.prev === "global")) {
                state.rules  = false;
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
            out.source = node.value;
            
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
}

exports.parse = parse;

exports.decl = function(file, decl) {
    var parsed;
    
    if(decl.prev() && decl.prev().prop !== "composes") {
        throw decl.error("composes must be the first declaration in the rule", { word : "composes" });
    }
    
    parsed = parse(decl.value.trim());
    
    if(!parsed) {
        throw decl.error("Unable to parse composition", { word : decl.value });
    }
    
    if(parsed.source && parsed.source !== "super") {
         parsed.source = resolve(file, parsed.source);
    }
    
    return parsed;
};

exports.rule = function(file, rule) {
    var parsed;
    
    parsed = parse(rule.params.trim());
    
    if(!parsed) {
        throw rule.error("Unable to parse composition", { word : rule.params });
    }
    
    if(parsed.source && parsed.source !== "super") {
         parsed.source = resolve(file, parsed.source);
    }
    
    return parsed;
};
