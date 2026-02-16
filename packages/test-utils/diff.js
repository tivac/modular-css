"use strict";

const snapshotDiff = require("snapshot-diff");

const defaults = {
    stablePatchmarks : true,
};

const diff = (valueA, valueB, options = {}) => snapshotDiff(valueA, valueB, { ...defaults, ...options });

module.exports = {
    diff,
};
