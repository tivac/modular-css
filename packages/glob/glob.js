"use strict";

const globule = require("globule");
const Processor = require("@modular-css/processor");

module.exports = (opts) => {
    const options = Object.assign(
            Object.create(null),
            {
                search : [ "**/*.css" ],
            },
            opts || {}
        );

    const processor = new Processor(options);

    return Promise.all(
        globule.find({
            src        : options.search,
            cwd        : processor.options.cwd,
            prefixBase : true,
        })
        .map((file) => processor.file(file))
    )
    .then(() => processor);
};
