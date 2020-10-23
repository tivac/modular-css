"use strict";

const escape = require("escape-string-regexp");

const search = `'use strict';`;

exports.regex = (deps) => {
    const parts = deps.map(escape);

    return new RegExp(
        `\\bmodule\\.import\\(['"]\\.\\/(${parts.join("|")})['"]\\)`,
        "g"
    );
};

exports.loader = ({ content, str }) => {
    const s = str.toString();
    const i = s.indexOf(search);

    // + 1 is for the newline...
    str.appendRight(
        i + search.length + 1,
        `${content}\n`
    );
};

exports.load = (options, imports, statement) => `
    Promise.all([
        ${imports},
        ${statement}
    ])
    .then((results) => results[results.length - 1])
`;

