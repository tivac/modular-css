"use strict";

const snapshot = require("jest-snapshot");
const snapshotDiff = require("snapshot-diff");

const defaults = {
    stablePatchmarks : true,
};

expect.extend({
    toMatchDiffSnapshot(
        valueA,
        valueB,
        options = {},
        testName = "",
      ) {
        const difference = snapshotDiff(valueA, valueB, { ...defaults, ...options });

        return snapshot.toMatchSnapshot.call(this, difference, testName);
      },
});
