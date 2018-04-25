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

            return {
                code : content
                    // Replace simple {css.<key>} values first
                    .replace(
                        new RegExp(`{css.(${Object.keys(exported).join("|")})}`, "gm"),
                        (match, key) => exported[key].join(" ")
                    )
                    // Then any remaining bare css.<key> values
                    .replace(
                        new RegExp(`(\\b)css.(${Object.keys(exported).join("|")})(\\b)`, "gm"),
                        (match, prefix, key, suffix) => `${prefix}"${exported[key].join(" ")}"${suffix}`
                    )
            };
        });
    };

exports.style = () => ({
    code : "/* replaced by modular-css */"
});
