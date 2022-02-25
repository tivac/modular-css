"use strict";

const escape = require("escape-string-regexp");

exports.replacer = (source, { identifier, lookup, keys }) => {
    const ids = keys.map(escape).join("|");
    const ident = escape(identifier);

    return source
        // Replace {<identifier>.<key>} values
        // Note extra exclusion to avoid accidentally matching ${<identifier>.<key>}
        .replace(
            new RegExp(`([^$]){${ident}\\.(${ids})}`, "gm"),
            (match, before, key) => {
                const replacement = lookup[key];

                return `${before}${replacement}`;
            }
        )

        // Then any remaining <identifier>.<key> values
        .replace(
            new RegExp(`(\\b)${ident}\\.(${ids})(\\b)`, "gm"),
            (match, before, key, suffix) => {
                const replacement = lookup[key];

                return `${before}"${replacement}"${suffix}`;
            }
        );
};

exports.replaceTrailingNewlines = (source, search) => source.replace(new RegExp(`${escape(search)}(?:\r?\n)*`), "");
