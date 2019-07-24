"use strict";

module.exports = {
    projects : [
        {
            displayName  : "tests",
            restoreMocks : true,
            notify       : true,

            coveragePathIgnorePatterns : [
                "/node_modules/",
                "/parsers/",
                "/@modular-css/test-utils/",
            ],

            watchPathIgnorePatterns : [
                "/output/",
                "/specimens/",
            ],

            setupFilesAfterEnv : [
                "<rootDir>/packages/test-utils/expect/toMatchDiffSnapshot.js",
                "<rootDir>/packages/test-utils/expect/toMatchRollupSnapshot.js",
                "<rootDir>/packages/test-utils/expect/toMatchRollupCodeSnapshot.js",
                "<rootDir>/packages/test-utils/expect/toMatchRollupAssetSnapshot.js",
            ],

            snapshotSerializers : [
                require.resolve("snapshot-diff/serializer.js"),
            ],
        },
        {
            displayName : "lint",
            runner      : "jest-runner-eslint",
            
            watchPlugins : [
                "jest-runner-eslint/watch-fix",
            ],
            
            testMatch : [
                "<rootDir>/packages/**/*.js",
            ],
        },
    ],
};
