"use strict";

const shell = require("shelljs");

const name = process.env.LERNA_PACKAGE_NAME;

const info = shell.exec("npm outdated --json", { silent : true }).stdout;

const packages = JSON.parse(info);
const keys = Object.keys(packages);

if(!keys.length) {
    return;
}

keys.forEach((key) => {
    const { wanted, latest } = packages[key];

    if(wanted === "linked" && latest === "linked") {
        return;
    }

    if(wanted === latest) {
        return;
    }

    // eslint-disable-next-line no-console
    console.log(name, key, { wanted, latest });
});
