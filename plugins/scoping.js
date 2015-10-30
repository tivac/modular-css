"use strict";

var postcss = require("postcss"),
    hasha   = require("hasha"),
    
    name = "postcss-modular-css-scoping";

module.exports = postcss.plugin(name, function(opts) {
    var options = opts || {};
    
    return function(css, result) {
        var lookup  = {},
            namer   = options.namer,
            prefix  = options.prefix;
            
        if(!prefix && !namer) {
            prefix = hasha(css.toString(), { algorithm : "md5" });
        }
        
        if(typeof namer !== "function") {
            namer = function(selector) {
                return prefix + "_" + selector;
            };
        }
        
        // Walk all classes and save off rewritten values
        css.walkRules(function(rule) {
            console.log(rule);

            /*rule.selectors.forEach(function(selector) {
                classes[selector] = namer(selector.slice(1));
            });*/
        });
        
        result.messages.push({
            type    : "modularcss",
            plugin  : name,
            classes : {}
        });
    };
});
