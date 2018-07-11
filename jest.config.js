"use strict";

module.exports = {
    restoreMocks : true,
    notify       : true,

    coveragePathIgnorePatterns : [
      "/node_modules/",
      "/parsers/",
      "/test-utils/",
    ],

    watchPathIgnorePatterns : [
        "/output/",
        "/specimens/",
    ],
};
