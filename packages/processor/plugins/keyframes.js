"use strict";

const escape = require("escape-string-regexp");

const message = require("../lib/message.js");

module.exports = (css, result) => {
    const refs = message(result, "keyframes");

    // Early out if there's nothing to replace
    if(!Object.keys(refs).length) {
        return;
    }

    const search = new RegExp(
        Object.keys(refs)
            .map((ref) => `(\\b${escape(ref)}\\b)`)
            .join("|"),
        "g"
    );

    // Go look up "animation" declarations and rewrite their names to scoped values
    css.walkDecls(/animation$|animation-name$/, (decl) => {
        decl.value = decl.value.replace(search, (match) => refs[match]);
    });
};

module.exports.postcssPlugin = "modular-css-keyframes";
