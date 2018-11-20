"use strict";

const from = require("resolve-from");

module.exports = (args) => {
    const options = Object.assign(
            Object.create(null),
            { aliases : {} },
            args
        );

    const aliases = Object.keys(options.aliases)
        .map((alias) => ({
            name   : alias,
            search : new RegExp(`^${alias}\\b`),
        }));

    return (src, file) => {
        const match = aliases.find((alias) => file.search(alias.search) > -1);

        if(!match) {
            return false;
        }

        return from.silent(
            options.aliases[match.name],
            file.replace(match.search, ".")
        );
    };
};
