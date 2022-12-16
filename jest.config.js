"use strict";

module.exports = {
    clearMocks   : true,
    resetMocks   : true,
    restoreMocks : true,
    notify       : true,

    coveragePathIgnorePatterns : [
        "/node_modules/",
        "/parsers/",
        "/packages/test-utils/",
        "/packages/vite/",
    ],

    testPathIgnorePatterns : [
        "/node_modules/",
        "/packages/vite/",
    ],

    watchPathIgnorePatterns : [
        "/output/",
        "/specimens/",
    ],

    setupFilesAfterEnv : [
        "<rootDir>/packages/test-utils/expect/toMatchDiffSnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchLogspySnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchRollupAssetSnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchRollupCodeSnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchRollupSnapshot.js",
    ],

    snapshotSerializers : [
        require.resolve("snapshot-diff/serializer.js"),
    ],
};
