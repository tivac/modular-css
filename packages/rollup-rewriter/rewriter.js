"use strict";

const fs = require("fs");

module.exports = (opts) => {
    const options = Object.assign(Object.create(null), {
        meta    : false,
        verbose : false,
    }, opts);

    return {
        name : "@modular-css/rollup-rewriter",

        writeBundle() {
            // TODO: everything lol
        }
    };
};
