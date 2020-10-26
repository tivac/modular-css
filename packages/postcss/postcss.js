"use strict";

const fs   = require("fs");
const path = require("path");
const postcss = require("postcss");
const mkdirp  = require("mkdirp");

const Processor = require("@modular-css/processor");
const { json : createJson } = require("@modular-css/processor/lib/output.js");

module.exports = postcss.plugin("modular-css", (opts = {}) =>
    async (root, result) => {
        const processor = new Processor({
            __proto__ : null,
            ...opts,
            ...result.opts,
        });

        const { exports : exported } = await processor.string(result.opts.from, root);
        
        const classes = exported;
                
        const output = await processor.output();

        const { json : writeJson } = processor.options;

        result.messages.push({
            type    : "modular-css-exports",
            exports : classes,
        });
        
        if(writeJson) {
            let dest = writeJson;

            if(typeof dest !== "string") {
                const { opts: { to } } = result;

                dest = `${path.join(path.dirname(to), path.basename(to, path.extname(to)))}.json`;
            }

            mkdirp.sync(path.dirname(dest));

            const json = createJson(output.compositions);
            
            fs.writeFileSync(
                dest,
                JSON.stringify(json, null, 4)
            );
        }

        return output;
    }
);
