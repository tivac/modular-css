"use strict";

const from = require("resolve-from");
const escape = require("escape-string-regexp");

module.exports = (opts) => {
    const options = {
        __proto__ : null,
        aliases   : {},
        ...opts,
    };

    const aliases = Object.keys(options.aliases).map((alias) => ({
        name   : alias,
        search : new RegExp(`^${escape(alias)}\\b`),
    }));

    return (src, file) => {
        const match = aliases.find(({ search }) => file.search(search) > -1);

        if(!match) {
            return false;
        }

        return from.silent(
            options.aliases[match.name],
            file.replace(match.search, ".")
        );
    };
};
