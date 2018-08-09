"use strict";

module.exports = {
    restoreMocks : true,
    notify       : true,

    // Work around JsDOM security issue
    // https://github.com/facebook/jest/issues/6766
    testURL : "http://localhost/",

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
