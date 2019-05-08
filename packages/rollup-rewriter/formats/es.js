"use strict";

const escape = require("escape-string-regexp");

exports.regex = (deps) => {
    const parts = deps.map(escape);

    return new RegExp(
        `\\bimport\\(['"]\\.\\/(${parts.join("|")})['"]\\)`,
        "g"
    );
};

exports.loader = (options, str) => str.prepend(`${options.loader}\n`);

exports.load = (options, imports, statement) => `
    Promise.all([
        ${imports},
        ${statement}
    ])
    .then((results) => results[results.length - 1])
`;

