"use strict";

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");

module.exports = (_, options) => {
    const {
        processor = new Processor({ ...options, verbose : true }),
    } = options;

    return {
        name : "@modular-css/snowpack",

        resolve : {
            input  : [ ".css" ],
            output : [ ".js", ".css" ],
        },

        async load({ filePath }) {
            if(processor.has(filePath)) {
                processor.invalidate(filePath);
            }

            const { details } = await processor.file(filePath);

            const exported = output.fileCompositions(details, processor, { joined : true });
            const values = output.values(details.values);

            exported.$values = values;

            console.log(details.result.css);

            return {
                ".js"  : `export default ${JSON.stringify(exported, null, 4)};`,
                ".css" : details.result.css,
            };
        },
    };
};
