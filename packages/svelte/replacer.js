"use strict";

module.exports = (source, { identifier, lookup, keys }) => {
    const ids = keys.join("|");

    return source
        // Replace {<identifier>.<key>} values
        // Note extra exclusion to avoid accidentally matching ${<identifier>.<key>}
        .replace(
            new RegExp(`([^$]){${identifier}\\.(${ids})}`, "gm"),
            (match, before, key) => {
                const replacement = lookup[key];

                return `${before}${replacement}`;
            }
        )

        // Then any remaining <identifier>.<key> values
        .replace(
            new RegExp(`(\\b)${identifier}\\.(${ids})(\\b)`, "gm"),
            (match, before, key, suffix) => {
                const replacement = lookup[key];

                return `${before}"${replacement}"${suffix}`;
            }
        );
};
