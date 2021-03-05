"use strict";

const escape = require("escape-string-regexp");

const message = require("../lib/message.js");

module.exports = () => {
    let refs;
    let search;

    return {
        postcssPlugin : "modular-css-keyframes",

        Once(root, { result }) {
            refs = message(result, "keyframes");

            search = new RegExp(
                Object.keys(refs)
                    .map((ref) => `(\\b${escape(ref)}\\b)`)
                    .join("|"),
                "g"
            );
        },

        Declaration : {
            // Go look up "animation" declarations and rewrite their names to scoped values
            animation(decl, { result }) {
                // Early out if there's nothing to replace
                if(!Object.keys(refs).length) {
                    return;
                }

                decl.value = decl.value.replace(search, (match) => refs[match]);
            },

            // Go look up "animation-name" declarations and rewrite their names to scoped values
            ["animation-name"](decl, { result }) {
                // Early out if there's nothing to replace
                if(!Object.keys(refs).length) {
                    return;
                }

                decl.value = decl.value.replace(search, (match) => refs[match]);
            },
        },
    };
};

module.exports.postcss = true;
