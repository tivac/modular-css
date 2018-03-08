"use strict";

var utils   = require("loader-utils"),
    keyword = require("esutils").keyword,
    
    output = require("modular-css-core/lib/output.js");

module.exports = function(source) {
    var options   = utils.getOptions(this) || false,
        done      = this.async(),
        processor = this.options
            ? this.options.processor // Webpack 2 & 3
            : this._compiler.options.processor; // Webpack 4

    if(options.cjs) {
        this.emitWarning(
            new Error("cjs option is deprecated, used namedExports: false instead")
        );
    }

    this.cacheable();

    return processor.string(this.resourcePath, source)
        .then((result) => {
            var exported = output.join(result.exports),
                out      = [
                    `export default ${JSON.stringify(exported, null, 4)};`
                ];

            processor.dependencies(this.resourcePath).forEach(this.addDependency);

            // Just default object export in this case
            if(options.namedExports === false) {
                return done(null, out.join("\n"));
            }
            
            // Warn if any of the exported CSS wasn't able to be used as a valid JS identifier
            // and exclude from the output
            Object.keys(exported).forEach((ident) => {
                if(keyword.isReservedWordES6(ident) || !keyword.isIdentifierNameES6(ident)) {
                    this.emitWarning(new Error(`Invalid JS identifier "${ident}", unable to export`));
                    
                    return;
                }

                out.push(`export var ${ident} = ${JSON.stringify(exported[ident])};`);
            });

            return done(null, out.join("\n"));
        })
        .catch(done);
};
