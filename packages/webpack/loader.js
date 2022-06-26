"use strict";

const utils = require("loader-utils");

const { transform } = require("@modular-css/css-to-js");

const DEFAULTS = {
    styleExport   : true,
    namedExports  : true,
    defaultExport : true,
};

// Can't be an arrow function due to `this` usage :(
module.exports = async function(source) {
    const options   = {
        __proto__       : null,
        ...DEFAULTS,
        ...this.getOptions(),

        // Need this so webpack doesn't create terrible import
        // names that break snapshots
        relativeImports : true,
    };

    const done = this.async();
    const { processor } = this._compiler.options;
    const { resourcePath : file } = this;

    try {
        await processor.string(file, source);

        const { code, warnings } = transform(file, processor, options);

        warnings.forEach((warning) => {
            this.emitWarning(warning);
        });

        return done(null, code);
    } catch(e) {
        return done(e);
    }
};
