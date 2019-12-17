"use strict";

const fs = require("fs");

const svelte = require("svelte");

module.exports = async ({ file, preprocess = false }) => {
    // Get Svelte layout.html & turn it into a function we can use to generate HTML
    const source = fs.readFileSync(file, "utf8");

    let compiled;

    if(preprocess) {
        const preprocessed = await svelte.preprocess(
            source,
            {
                filename : file,
                ...preprocess,
            }
        );

        compiled = svelte.compile(preprocessed.toString(), { generate : "ssr" });
    } else {
        compiled = svelte.compile(source, { generate : "ssr" });
    }

    // Well *this* looks scary
    // eslint-disable-next-line no-eval
    return eval(compiled.js.code);
};
