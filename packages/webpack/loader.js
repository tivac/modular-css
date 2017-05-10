"use strict";

var utils   = require("loader-utils"),
    keyword = require("esutils").keyword,
    
    output = require("modular-css-core/lib/output.js");

module.exports = function(source) {
    var options   = utils.getOptions(this) || false,
        done      = this.async(),
        processor = this.options.processor;

    this.cacheable();

    return processor.string(this.resourcePath, source)
        .then((result) => {
            var classes = output.join(result.exports),
                deps    = processor.dependencies(this.resourcePath);

            deps.forEach((dep) => this.addDependency(dep));
            
            return done(
                null,
                options.cjs ?
                    `module.exports = ${JSON.stringify(classes, null, 4)};\n` :
                    Object.keys(classes).reduce(
                        (prev, curr) => {
                            // Warn if any of the exported CSS wasn't able to be used as a valid JS identifier
                            if(keyword.isReservedWordES6(curr) || !keyword.isIdentifierNameES6(curr)) {
                                this.emitWarning(new Error(`Invalid JS identifier "${curr}", unable to export`));
                                
                                return prev;
                            }
                            
                            return `export var ${curr} = "${classes[curr]}";\n${prev}`;
                        },
                        `export default ${JSON.stringify(classes, null, 4)};\n`
                    )
            );
        })
        .catch(done);
};
