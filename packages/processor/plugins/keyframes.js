"use strict";

const escape = require("escape-string-regexp");

const message = require("../lib/message.js");

module.exports = () => ({
    postcssPlugin : "modular-css-keyframes",

    prepare(result) {
        const refs = message(result, "keyframes");

        const search = new RegExp(
            Object.keys(refs)
            .map((ref) => `(\\b${escape(ref)}\\b)`)
            .join("|"),
            "g"
        );
        
        console.log({ refs, search, msgs : result.messages });
        
        return {
            Declaration : {
                // Go look up "animation" declarations and rewrite their names to scoped values
                animation(decl) {
                    console.log("animation", decl.value);

                    // Early out if there's nothing to replace
                    if(!Object.keys(refs).length) {
                        return;
                    }

                    decl.value = decl.value.replace(search, (match) => refs[match]);
                },
    
                // Go look up "animation-name" declarations and rewrite their names to scoped values
                ["animation-name"](decl) {
                    // Early out if there's nothing to replace
                    if(!Object.keys(refs).length) {
                        return;
                    }

                    console.log("animation-name", decl.value);
    
                    decl.value = decl.value.replace(search, (match) => refs[match]);
                },
            },
        };
    },
});

module.exports.postcss = true;
