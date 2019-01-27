"use strict";

const path = require("path");

const shell = require("shelljs");

module.exports = () => ({
    name : "rollup-plugin-add-watch-files",
    
    buildStart() {
        // Watch markdown files for changes
        shell
            .find(path.resolve(__dirname, `../src/**/*.md`))
            .forEach((doc) => this.addWatchFile(doc));
    },
});

