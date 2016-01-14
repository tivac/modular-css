"use strict";

// Export browserify transform by default for ease of use
module.exports = require("./src/browserify");

// Then weirdly stick .process on there so it's also accessible
module.exports.Processor = require("./src/processor");
