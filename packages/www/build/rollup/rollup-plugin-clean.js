"use strict";

const path = require("path");

const shell = require("shelljs");

const { dest } = require("../environment.js");

module.exports = () => {
    shell.rm("-rf", path.join(dest, "*"));
    
    return {
        name : "rollup-plugin-clean",
    };
};
