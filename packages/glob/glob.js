"use strict";

const globule = require("globule");
const Processor = require("@modular-css/processor");

module.exports = async (
    /* istanbul ignore next: can't test this */
    opts = {}
) => {
    const options = {
        __proto__ : null,
        
        search : [ "**/*.css" ],
        ...opts,
    };

    const processor = new Processor(options);

    await Promise.all(
        globule.find({
            src        : options.search,
            cwd        : processor.options.cwd,
            prefixBase : true,
        })
        .map((file) => processor.file(file))
    );

    return processor;
};
