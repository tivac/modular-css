const search = `'use strict';`;

exports.regex = (deps) => new RegExp(
    `require\\(\\[['"]\\.\\/(${deps})['"]\\], resolve, reject\\)`,
    "g"
);

exports.loader = (options, str) => {
    const s = str.toString();
    const i = s.indexOf(search);

    if(i === -1) {
        throw new Error("Unable to find strict mode declaration");
    }
    
    // + 1 is for the newline...
    str.appendRight(
        i + search.length + 1,
        `import lazyload from "./css.js";\n`
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
        
