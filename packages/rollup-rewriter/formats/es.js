exports.regex = (deps) => new RegExp(
    `\\bimport\\(['"]\\.\\/(${deps})['"]\\)`,
    "g"
);

exports.loader = (options, str) => str.prepend(
    `import lazyload from "./css.js";\n`
);

exports.load = (options, imports, statement) => `
    Promise.all([
        ${imports},
        ${statement}
    ])
    .then((results) => results[results.length - 1])
`;
        
