"use strict";

const xregexp = require("xregexp");

// Parse a rollup template like "[name]-[hash][extname]" & a filename generated
// from that template into its constituent parts using a bunch of regex nonsense.
// Using xregexp because it allows for supporting node < 10

const patterns = new Map([
    [ "extname",  "(?<extname>\\.\\w+)" ],
    [ "ext",      "(?<ext>\\w+)" ],
    [ "hash",     "(?<hash>[a-f0-9]{8})" ],
    [ "name",     "(?<name>\\w+)" ],
]);

const patternsRegex = new RegExp(
    `\\[(${[ ...patterns.keys() ].join("|")})\\]`,
    "ig"
);

exports.parse = (template, name) => {
    const marked = xregexp.escape(
        template.replace(patternsRegex, (match, key) => `!!${key}!!`)
    );
    
    const parser = xregexp(
        marked.replace(/!!(.+?)!!/g, (match, key) => patterns.get(key)),
        "i"
    );

    return xregexp.exec(name, parser);
};
