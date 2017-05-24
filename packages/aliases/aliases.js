"use strict";

var from = require("resolve-from");

module.exports = function(args) {
    var options = Object.assign(
            Object.create(null),
            { aliases : {} },
            args
        ),
        aliases = Object.keys(options.aliases)
            .map((alias) => ({
                name   : alias,
                search : new RegExp(`^${alias}\\b`)
            }));
    
    return (src, file) => {
        var match;

        match = aliases.find((alias) => file.search(alias.search) > -1);

        if(!match) {
            return false;
        }

        return from.silent(
            options.aliases[match.name],
            file.replace(match.search, ".")
        );
    };
};
