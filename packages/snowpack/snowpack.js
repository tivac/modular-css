"use strict";

const Processor = require("@modular-css/processor");
const output = require("@modular-css/processor/lib/output.js");

module.exports = (snowpackConfig, options) => {
    const {
        processor = new Processor({ ...options }),
    } = options;

    return {
        name : "@modular-css/snowpack",

        resolve : {
            input  : [ ".css" ],
            output : [ ".js", ".css" ],
        },

        async onChange({ filePath }) {
            console.log("onChange", filePath);

            if(!processor.has(filePath)) {
                return;
            }

            // TODO: should the file be removed if it's gone?
            processor.invalidate(filePath);

            const deps = processor.fileDependents(filePath);

            console.log(deps);

            deps.forEach((dep) => this.markChanged(dep));
        },

        async load({ filePath }) {
            console.log("LOAD", filePath);

            if(processor.has(filePath)) {
                processor.invalidate(filePath);
            }

            const { details } = await processor.file(filePath);

            const exported = output.fileCompositions(details, processor, { joined : true });
            const values = output.values(details.values);

            exported.$values = values;

            return {
                ".js"  : `export default ${JSON.stringify(exported, null, 4)};`,
                ".css" : details.result.css,
            };
        },

        async transform({ fileExt, id }) {
            if(fileExt !== ".css") {
                return;
            }
            
            console.log("TRANSFORM", id);
            
            // TODO: need to know what svelte files depend on this CSS file and call
            // this.markChanged() on them, will need to add that to @modular-css/svelte
            // and store it in the processor instance somewhere
            const deps = processor.fileDependencies(id);

            const result = await processor.output({
                // Can't use this.getAssetFileName() here, because the source hasn't been set yet
                //  Have to do our best to come up with a valid final location though...
                to    : id,
                files : [ ...deps, id ],
            });

            console.log(result.css);

            return result.css;
        },
    };
};
