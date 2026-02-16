"use strict";

const escape = require("escape-string-regexp");

exports.replacer = (source, { identifier, lookup, keys, classAttr } = false) => {
    const ids = keys.map(escape).join("|");
    const ident = escape(identifier);

    if(classAttr) {
        // Replace class={<identifier>.<key>} values
        source = source.replace(
            new RegExp(`(class=)("|')?{${ident}\\.(${ids})}("|')?`, "gm"),
            (match, before, quote1, key, quote2) => {
                const replacement = quote1 ? lookup[key] : JSON.stringify(lookup[key]);

                return `${before}${quote1 || ""}${replacement}${quote2 || ""}`;
            }
        );
    } else {
        // Replace {<identifier>.<key>} values
        // Note extra exclusion to avoid accidentally matching ${<identifier>.<key>}
        source = source.replace(
            new RegExp(`([^$]){${ident}\\.(${ids})}`, "gm"),
            (match, before, key) => {
                const replacement = lookup[key];

                return `${before}${replacement}`;
            }
        );
    }

    // Then any remaining <identifier>.<key> values
    return source.replace(
        new RegExp(`(\\b)${ident}\\.(${ids})(\\b)`, "gm"),
        (match, before, key, suffix) => {
            const replacement = lookup[key];

            return `${before}"${replacement}"${suffix}`;
        }
    );
};

exports.replaceTrailingNewlines = (source, search) => source.replace(new RegExp(`${escape(search)}(?:\r?\n)*`), "");
