"use strict";

exports.markup = (processor) => ({ content, filename }) => {
        const search = /<style[\S\s]*?>([\S\s]*?)<\/style>/igm;
        const matches = search.exec(content);

        if(!matches) {
            return {
                code : content
            };
        }

        const style = matches[1];

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
        });
    };

exports.style = () => ({
    code : "/* replaced by modular-css */"
});
