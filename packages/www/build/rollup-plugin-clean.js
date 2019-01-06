"use strict";

const shell = require("shelljs");

module.exports = () => ({
    name : "rollup-plugin-clean",

    buildStart() {
        shell.rm("-rf", "./dist/*");
    },
});
