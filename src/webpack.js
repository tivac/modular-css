"use strict";

var Processor = require("./processor"),
    output = require("./lib/output"),
    processor = new Processor();

// https://webpack.github.io/docs/loaders.html
module.exports = function(source) {
    var callback = this.async();

    processor.string(this.resourcePath, source).then((result) => {
        callback(null, "module.exports = " + JSON.stringify(output.join(result.exports), null, 4) + ";");
    });
};
