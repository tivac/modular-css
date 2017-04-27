"use strict";

var path = require("path"),

    keyword = require("esutils").keyword,
    
    output   = require("modular-css-core/lib/output.js"),
    relative = require("modular-css-core/lib/relative.js");

module.exports = function(source) {
    var done      = this.async(),
        processor = this.options.processor;

    this.cacheable();

    return processor.string(this.resourcePath, source)
        .then((result) => {
            var classes = output.join(result.exports),
                deps    = processor.dependencies(this.resourcePath),
                imports = deps.map((file) =>
                    `import "${relative.prefixed(path.dirname(this.resourcePath), file)}";`
                );

            deps.forEach((dep) => this.addDependency(dep));
            
            return done(
                null,
                (imports.length ? `${imports.join("\n")}\n` : "") +
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
