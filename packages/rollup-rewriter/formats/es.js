exports.regex = (deps) => new RegExp(
    `\\bimport\\(['"]\\.\\/(${deps})['"]\\)`,
    "g"
);

exports.loader = (options, str) => str.prepend(`${options.loader}\n`);

exports.load = (options, imports, statement) => `
    Promise.all([
        ${imports},
        ${statement}
    ])
    .then((results) => results[results.length - 1])
`;

