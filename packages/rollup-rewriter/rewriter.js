"use strict";

const MagicString = require("magic-string");
const dedent = require("dedent");
const escape = require("escape-string-regexp");

const formats = {
    es     : require("./formats/es.js"),
    amd    : require("./formats/amd.js"),
    system : require("./formats/system.js"),
};

const supported = new Set([ "amd", "es", "esm", "system" ]);

module.exports = (opts) => {
    const options = Object.assign(Object.create(null), {
        meta    : false,
        verbose : false,
    }, opts);

    // eslint-disable-next-line no-console, no-empty-function
    const log = options.verbose ? console.log.bind(console, "[rewriter]") : () => {};

    return {
        name : "@modular-css/rollup-rewriter",

        generateBundle({ format }, chunks) {
            if(!supported.has(format)) {
                this.error(`Unsupported format: ${format}. Supported formats are ${JSON.stringify([ ...supported.values() ])}`);
            }

            Object.entries(chunks).forEach(([ entry, chunk ]) => {
                const {
                    isAsset = false,
                    assets = [],
                    code = "",
                    dynamicImports = [],
                } = chunk;
                
                // Guard against https://github.com/rollup/rollup/issues/2659
                const deps = dynamicImports.filter(Boolean);
                
                if(isAsset || !deps.length || !assets.length) {
                    return;
                }

                const { regex, prepend, load } = formats[format] || formats.es;

                const search = regex(deps.map(escape).join("|"));
        
                const str = new MagicString(code);
                
                // TODO: make configurable
                prepend(options, str);
        
                // Yay stateful regexes
                search.lastIndex = 0;
        
                let result = search.exec(code);
        
                while(result) {
                    // Pull useful values out of the regex result
                    const [ statement, file ] = result;
                    const { index } = result;
        
                    const imports = [
                        // TODO: make configurable
                        ...chunks[file].assets.map((dep) => `lazyload("./${dep}")`),
                    ].join(",\n");
        
                    str.overwrite(
                        index,
                        index + statement.length,
                        dedent(load(options, imports, statement))
                    );
        
                    result = search.exec(code);
                }
        
                log("Overwriting", entry);
                
                chunk.code = str.toString();
            });
        },
    };
};
