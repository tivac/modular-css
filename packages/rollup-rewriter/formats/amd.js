"use strict";

const path = require("path");

const escape = require("escape-string-regexp");

const search = `'use strict';`;

exports.regex = (deps) => {
    const parts = deps.map((dep) =>
        escape(dep.replace(path.extname(dep), ""))
    );

    return new RegExp(
        `require\\(\\[['"]\\.\\/(${parts.join("|")})['"]\\], resolve, reject\\)`,
        "g"
    );
};

exports.loader = (options, str) => {
    const s = str.toString();
    const i = s.indexOf(search);

    if(i === -1) {
        throw new Error("Unable to find strict mode declaration");
    }

    // + 1 is for the newline...
    str.appendRight(
        i + search.length + 1,
        `${options.loader}\n`
    );
};

exports.load = (options, imports, statement) => `
    Promise.all([
        ${imports},
        new Promise(function (resolve, reject) { ${statement} })
    ])
    .then((results) => resolve(results[results.length - 1]))
    .catch(reject)
`;

