"use strict";

const Processor = require("modular-css-core");

module.exports = function(config, args) {
    let processor = new Processor(args);

    return Object.assign({}, config, {
        css : () => {
            // Use this hook to write out the results to args.css
        },

        preprocess : {
            markup : ({ content, options }) => {
                console.log("markup");
                console.log(content);
                console.log(options.filename);

                return {
                    code : content
                };
            },

            style : ({ content, options }) => processor.string(
                    options.filename,
                    content
                )
                .then((result) => ({
                    code : result.details.result.css
                }))
                .catch((err) => {
                    throw err;
                })
        }
    });
};
