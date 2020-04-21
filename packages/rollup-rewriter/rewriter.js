"use strict";

const path = require("path");

const MagicString = require("magic-string");
const dedent = require("dedent");
const { DepGraph } = require("dependency-graph");

const formats = {
    es     : require("./formats/es.js"),
    amd    : require("./formats/amd.js"),
    system : require("./formats/system.js"),

    // Just an alias...
    esm : require("./formats/es.js"),
};

const supported = new Set(Object.keys(formats).sort());

const DEFAULTS = {
    loader  : false,
    loadfn  : false,
    verbose : false,
};

module.exports = (opts = {}) => {
    const options = {
        __proto__ : null,
        ...DEFAULTS,
        ...opts,
    };

    if(!options.loadfn) {
        throw new Error("options.loadfn must be configured");
    }

    // eslint-disable-next-line no-console, no-empty-function
    const log = options.verbose ? console.log.bind(console, "[rewriter]") : () => {};

    return {
        name : "@modular-css/rollup-rewriter",

        generateBundle({ format }, chunks) {
            if(!supported.has(format)) {
                // This throws, so execution stops here even though it doesn't look like it
                this.error(`Unsupported format: ${format}. Supported formats are ${JSON.stringify([ ...supported.values() ])}`);
            }

            const entries = new Map();
            const graph = new DepGraph({ circular : true });

            Object.entries(chunks).forEach(([ entry, chunk ]) => {
                const { type, dynamicImports } = chunk;

                if(type === "asset") {
                    return;
                }

                // Guard against https://github.com/rollup/rollup/issues/2659
                const imported = dynamicImports.filter(Boolean);

                if(imported.length) {
                    entries.set(entry, imported);
                }

                graph.addNode(entry);

                imported.forEach((file) => {
                    graph.addNode(file);
                    graph.addDependency(entry, file);
                });
            });

            entries.forEach((deps, entry) => {
                const { code } = chunks[entry];

                const { regex, loader, load } = formats[format];

                const search = regex(deps);

                const str = new MagicString(code);

                if(options.loader) {
                    const content = typeof options.loader === "function" ?
                        options.loader({ chunks, options }) :
                        options.loader;

                    loader({ content, str });
                }

                // Yay stateful regexes
                search.lastIndex = 0;

                let result = search.exec(code);

                while(result) {
                    // Pull useful values out of the regex result
                    const [ statement, ident ] = result;
                    const { index } = result;

                    // TODO: is assuming .js safe here?
                    const file = path.extname(ident).length ? ident : `${ident}.js`;

                    // eslint-disable-next-line no-loop-func
                    const css = [
                        ...graph.dependenciesOf(file),
                        ...(file in chunks ? chunks[file].imports : []),
                        file,
                    ].reduce((out, curr) => {
                        if(!chunks[curr]) {
                            return out;
                        }

                        const { assets = [] } = chunks[curr];

                        assets.forEach((asset) => out.add(asset));

                        return out;
                    }, new Set());

                    if(css.size) {
                        const imports = [ ...css ].map((dep) =>
                            `${options.loadfn}("./${dep}")`
                        );

                        str.overwrite(
                            index,
                            index + statement.length,
                            dedent(load(options, imports.join(",\n"), statement))
                        );
                    }

                    result = search.exec(code);
                }

                log("Updating", entry);

                chunks[entry].code = str.toString();
            });
        },
    };
};
