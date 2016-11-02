"use strict";

var postcss = require("postcss"),
    escape  = require("escape-string-regexp"),

    message = require("../lib/message"),
    
    plugin = "postcss-modular-css-keyframes";

module.exports = postcss.plugin(plugin, function() {
    return function(css, result) {
        var refs   = message(result, "keyframes"),
            search = new RegExp(`(\\b${Object.keys(refs).map(escape).join("\\b)|(\\b")}\\b)`, "g");
        
        // Go look up "animation" declarations and rewrite their names to scoped values
        css.walkDecls(/animation$|animation-name$/, function(decl) {
            decl.value = decl.value.replace(search, (match) => refs[match]);
        });
    };
});
