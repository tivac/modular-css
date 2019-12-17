"use strict";

const map = require("lodash/mapValues");

const relative = require("./relative.js");

exports.join = (output) =>
    map(output, (classes) => (
            classes.join(" ")
    ));

exports.compositions = ({ options, files }) => {
    const { cwd } = options;
    const json = {};

    Object.keys(files)
        .sort()
        .forEach((file) =>
            (json[relative(cwd, file)] = exports.join(files[file].exports))
        );

    return json;
};
