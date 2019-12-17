"use strict";

const fs   = require("fs");
const path = require("path");
const postcss = require("postcss");
const mkdirp  = require("mkdirp");
const Processor = require("@modular-css/processor");

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

        let { json } = processor.options;

        result.messages.push({
            type    : "modular-css-exports",
            exports : classes,
        });
        
        if(json) {
            if(typeof json !== "string") {
                const { opts: { to } } = result;

                json = `${path.join(path.dirname(to), path.basename(to, path.extname(to)))}.json`;
            }

            mkdirp.sync(path.dirname(json));
            
            fs.writeFileSync(
                json,
                JSON.stringify(output.compositions, null, 4)
            );
        }

        return output;
    }
);
