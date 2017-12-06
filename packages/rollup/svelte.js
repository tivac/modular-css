"use strict";

const fs = require("fs");

const Processor = require("modular-css-core");

module.exports = function(args) {
    const files = Object.create(null);
    const processor = new Processor(args);

    return {
        preprocess : {
            markup : ({ content, filename }) => {
                const search = /<style[\S\s]*?>([\S\s]*?)<\/style>/igm;
                const style = search.exec(content)[1];

                return processor.string(
                    filename,
                    style
                )
                .then((result) => {
                    const exported = result.files[result.file].exports;
                    const regexp = new RegExp(`\{\{css.(${Object.keys(exported).join("|")})}}`, "gm");

                    return {
                        code : content.replace(regexp, (match, key) => {
                            if(!exported[key]) {
                                throw new Error(`Mismatched key: ${match}`);
                            }
                            
                            return exported[key].join(" ");
                        })
                    };
                })
                .catch((err) => {
                    console.error(err.toString());
                    
                    throw err;
                });
            },

            // Remove all the CSS, we'll write it out ourselves in the plugin
            style : () => ({
                code : "/* replaced by modular-css */"
            })
        },

        plugin : {
            name : "modular-css-rollup-svelte",

            ongenerate : (bundle, result) => {
                result.css = processor.output({
                    to : args.css
                });
            },

            onwrite : (bundle, result) => result.css.then((data) => {
                    if(args.css) {
                        // mkdirp.sync(path.dirname(options.css));
                        
                        fs.writeFileSync(
                            args.css,
                            data.css
                        );
                    }
                })
        }
    };
};
