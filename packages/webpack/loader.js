"use strict";

var utils   = require("loader-utils"),
    keyword = require("esutils").keyword,
    
    output = require("modular-css-core/lib/output.js");

module.exports = function(source) {
    var options   = utils.getOptions(this) || false,
        done      = this.async(),
        processor = this.options.processor;

    if(this.options.cjs) {
        this.emitWarning(
            new Error("cjs option is deprecated, used namedExports: false instead")
        );
    }

    this.cacheable();

    return processor.string(this.resourcePath, source)
        .then((result) => {
            var classes = output.join(result.exports),
                deps    = processor.dependencies(this.resourcePath),
                out     = `export default ${JSON.stringify(classes, null, 4)};\n`,
                named   = Object.keys(classes);

            deps.forEach((dep) => this.addDependency(dep));

            // Just default object export in this case
            if(options.namedExports === false) {
                return done(null, out);
            }
            
            // Warn if any of the exported CSS wasn't able to be used as a valid JS identifier
            // and exclude from the output
            named = named.filter((ident) => {
                if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                    this.emitWarning(new Error(`Invalid JS identifier "${ident}", unable to export`));
                    
                    return false;
                }

                return true;
            });

            return done(
                null,
                named.map((ident) => `export var ${ident} = "${classes[ident]}";`)
                    .concat(out)
                    .join("\n")
            );
        })
        .catch(done);
};
