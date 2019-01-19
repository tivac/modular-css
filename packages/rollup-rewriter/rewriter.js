"use strict";

const fs = require("fs");
const path = require("path");

const Graph = require("dependency-graph").DepGraph;
const MagicString = require("magic-string");
const dedent = require("dedent");

module.exports = (opts) => {
    const options = Object.assign(Object.create(null), {
        meta    : false,
        verbose : false,
    }, opts);

    // eslint-disable-next-line no-console, no-empty-function
    const log = options.verbose ? console.log.bind(console, "[rewriter]") : () => {};

    // Shared values between the hooks
    let graph;
    let dest;

    return {
        name : "@modular-css/rollup-rewriter",

        generateBundle({ dir = false }, chunks) {
            if(!dir) {
                throw new Error("@modular-css/rollup-rewriter only works with code-splitting, set output.dir");
            }

            // Save off for usage in writeBundle hook below
            dest = dir;

            // Create a dependency graph of entries <-> dynamic imports to know which
            // chunks need rewriting later
            graph = new Graph({ circular : true });

            Object.entries(chunks).forEach(([ entry, { isAsset = false, dynamicImports = [] }]) => {
                if(isAsset) {
                    return;
                }

                graph.addNode(entry);
                
                dynamicImports
                    .filter(Boolean)
                    .forEach((dep) => {
                        graph.addNode(dep);
                        graph.addDependency(entry, dep);
                    });
            });
        },

        // Have to write the updated files out to disk manually in the writeBundle step
        writeBundle(chunks) {
            Object.entries(chunks).forEach(([ entry, info ]) => {
                const {
                    isAsset = false,
                    assets = [],
                    code = ""
                } = info;

                if(isAsset || !assets.length) {
                    return;
                }

                const deps = graph.dependenciesOf(entry);

                if(!deps.length) {
                    return;
                }

                // Yeah, I'm doing this via a regexp. What?
                const search = new RegExp(
                    `import\\(['"]\\.\\/(${deps.map(escape).join("|")})['"]\\)`,
                    "g"
                );

                const str = new MagicString(code.toString());

                // TODO: make configurable
                // str.prepend(`import lazyload from "./css.js";\n`);

                // Yay stateful regexes
                search.lastIndex = 0;

                let result = search.exec(code);

                while(result) {
                    // Pull useful values out of the regex result
                    const [ statement, file ] = result;
                    const { index } = result;

                    const imports = [
                        // TODO: probably needs to be configurable...
                        ...chunks[file].assets.map((dep) => `lazyload("./${dep}")`),
                        statement,
                    ];

                    // TODO: failing for some reason, maybe because I'm using code instad of
                    // reading from fs?
                    // str.overwrite(index, statement.length, dedent(`
                    //     Promise.all([
                    //         ${imports.join(",\n")}
                    //     ])
                    //     .then((results) => results[${imports.length - 1}])
                    // `));

                    result = search.exec(code);
                }

                log("Overwriting", entry);

                // Write out updated value over the original
                fs.writeFileSync(path.join(dest, entry), str.toString(), "utf8");
            });
        }
    };
};
