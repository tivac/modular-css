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
