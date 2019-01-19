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

            Object.entries(chunks).forEach(([ entry, { dynamicImports = [] }]) => {
                // See https://github.com/rollup/rollup/issues/2659
                const deps = dynamicImports.filter(Boolean);
                
                if(!deps.length) {
                    return;
                }

                graph.addNode(entry);

                deps.forEach((dep) => {
                    graph.addNode(dep);
                    graph.addDependency(entry, dep);
                });
            });
        },

        // Have to write the updated files out to disk manually in the writeBundle step
        writeBundle(chunks) {
            const chunk = Object.entries(chunks).find(([ entry, { isAsset = false }]) => (
                isAsset && entry.endsWith(options.meta || "metadata.json")
            ));

            if(!chunk) {
                throw new Error("Unable to find CSS metadata, did you set meta : true in @modular-css/rollup options?");
            }

            const { source : json } = chunk;

            const entries = Object.keys(json);
            
            // Figure out which files will need to be rewritten
            const files = new Set();

            entries.forEach((entry) =>
                graph.dependantsOf(entry).forEach((dep) => files.add(dep))
            );

            // Yeah, I'm doing this via a regexp. What?
            const search = new RegExp(
                `import\\(['"](${entries.map(escape).join("|")})['"]\\)`,
                "g"
            );

            files.forEach((file) => {
                const source = chunks[file].code;
                const str = new MagicString(source);

                // TODO: make configurable
                str.prepend(`import lazyload from "./css.js";\n`);

                // Yay stateful regexes
                search.lastIndex = 0;

                let result = search.exec(source);

                while(result) {
                    // Pull useful values out of the regex result
                    const [ statement, entry ] = result;
                    const { index } = result;

                    const imports = [
                        // TODO: probably needs to be configurable...
                        ...json[entry].dependencies.map((dep) => `lazyload("./${dep}")`),
                        statement,
                    ];

                    str.overwrite(index, statement.length, dedent(`
                        Promise.all([
                            ${imports.join(",\n")}
                        ])
                        .then((results) => results[${imports.length - 1}])
                    `));

                    result = search.exec(source);
                }

                log("Overwriting", file);

                // Write out updated value over the original
                fs.writeFileSync(path.join(dest, file), str.tostring(), "utf8");
            });
        }
    };
};
