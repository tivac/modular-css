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
        "/packages/aliases/",
        "/packages/css-to-js/",
        "/packages/glob/",
        "/packages/namer/",
        "/packages/paths/",
        "/packages/rollup/",
        "/packages/rollup-rewriter/",
        "/packages/svelte",
        "/packages/vite/",
    ],

    watchPathIgnorePatterns : [
        "/output/",
        "/specimens/",
    ],

    setupFilesAfterEnv : [
        "<rootDir>/packages/test-utils/expect/toMatchDiffSnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchRollupAssetSnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchRollupCodeSnapshot.js",
        "<rootDir>/packages/test-utils/expect/toMatchRollupSnapshot.js",
    ],

    snapshotSerializers : [
        require.resolve("snapshot-diff/serializer.js"),
    ],
};
