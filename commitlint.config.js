"use lint";

const conventional = require("@commitlint/config-conventional");
const type = conventional.rules["type-enum"].slice();

module.exports = {
    extends : [
        "@commitlint/config-conventional"
    ],

    rules : {
        "type-enum" : [
            type[0],
            type[1],
            type[2].concat([
                "wip"
            ])
        ]
    }
};
