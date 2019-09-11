"use strict";

const escape = require("escape-string-regexp");

exports.regex = (deps) => {
    const parts = deps.map(escape);

    return new RegExp(
        `\\bimport\\(['"]\\.\\/(${parts.join("|")})['"]\\)`,
        "g"
    );
};

exports.loader = ({ content, str }) => str.prepend(`${content}\n`);

exports.load = (options, imports, statement) => `
    Promise.all([
        ${imports},
        ${statement}
    ])
    .then((results) => results[results.length - 1])
`;

