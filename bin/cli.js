/* eslint no-console:0 */
"use strict";

var fs = require("fs"),

    imports = require("../imports"),

    result, out;

// Update checking
require("update-notifier")({ pkg : require("../package.json" ) }).notify({ defer : true });

result = imports.process(process.argv[2]);

if(!process.argv[3]) {
    return console.log(result.css);
}

out = process.argv[3];

fs.writeFileSync(out, result.css, "utf8");
fs.writeFileSync(
    result.css + ".json",
    JSON.stringify(result.exports),
    "utf8"
);
