"use strict";

const GRAPH_SEP = "::";
const FILE_PREFIX = `file${GRAPH_SEP}`;
const SELECTOR_PREFIX = `selector${GRAPH_SEP}`;
const VALUE_PREFIX = `value${GRAPH_SEP}`;

exports.selectorKey = (file, selector) => `${SELECTOR_PREFIX}${file}${GRAPH_SEP}${selector}`;
exports.fileKey = (file) => `${FILE_PREFIX}${file}`;
exports.valueKey = (file, value) => `${VALUE_PREFIX}${file}${GRAPH_SEP}${value}`;

exports.cleanPrefix = (prefix, key) => key.replace(prefix, "");

exports.filterByPrefix = (prefix, things, { clean = true } = false) => things.reduce((acc, thing) => {
    if(!thing.startsWith(prefix)) {
        return acc;
    }

    acc.push(clean ? exports.cleanPrefix(prefix, thing) : thing);

    return acc;
}, []);

exports.isFile = (key) => key.startsWith(FILE_PREFIX);
exports.isSelector = (key) => key.startsWith(SELECTOR_PREFIX);
exports.isValue = (key) => key.startsWith(VALUE_PREFIX);

exports.FILE_PREFIX = FILE_PREFIX;
exports.SELECTOR_PREFIX = SELECTOR_PREFIX;
exports.VALUE_PREFIX = VALUE_PREFIX;
