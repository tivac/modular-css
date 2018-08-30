"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    postcss = require("postcss"),
    mkdirp  = require("mkdirp"),
    
    Processor = require("@modular-css/processor");

module.exports = postcss.plugin("modular-css", (opts) =>
    (root, result) => {
        var processor = new Processor(Object.assign(
                Object.create(null),
                opts,
                result.opts
            )),
            classes;

        return processor.string(result.opts.from, root)
            .then((output) => {
                classes = output.exports;
                
                return processor.output();
            })
            .then((output) => {
                var { json } = processor.options;

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
            });
    }
);
