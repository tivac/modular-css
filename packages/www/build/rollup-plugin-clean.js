"use strict";

const shell = require("shelljs");

module.exports = () => {
    shell.rm("-rf", "./dist/*");
    
    return {
        name : "rollup-plugin-clean",
    };
};
