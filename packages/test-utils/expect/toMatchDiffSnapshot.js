"use strict";

const { toMatchDiffSnapshot } = require("snapshot-diff");

expect.extend({ toMatchDiffSnapshot });
