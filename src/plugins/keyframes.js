"use strict";

var postcss = require("postcss"),
    
    message = require("../lib/message"),
    
    plugin = "postcss-modular-css-keyframes";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var refs  = message(result, "classes"),
            names = Object.keys(refs);
        
        // Go look up "animation" declarations and rewrite their names to scoped values
        css.walkDecls(/animation$|animation-name$/, function(decl) {
            names.some(function(name) {
                if(decl.value.indexOf(name) === -1) {
                    return false;
                }
                
                decl.value = decl.value.replace(name, refs[name]);
                
                return true;
            });
        });
    };
});
