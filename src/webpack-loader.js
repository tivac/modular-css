"use strict";

var output = require("./lib/output");

module.exports = function(source) {
    var done      = this.async(),
        processor = this.options.processor;

    this.cacheable();

    processor.string(this.resourcePath, source)
        .then((result) => {
            processor.dependencies(this.resourcePath).forEach((dep) => this.addDependency(dep));
            
            done(
                null,
                `module.exports = ${JSON.stringify(output.join(result.exports), null, 4)};`
            );
        })
        .catch((error) => done(error));
};
