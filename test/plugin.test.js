"use strict";

var fs = require("fs"),
    path = require("path"),

    plugin = require("../src/plugin.js");

describe("/plugin.js", function() {
    it.only("should process a file", function() {
        plugin.process(fs.readFileSync("./test/specimens/externals.css"), {
            from : path.resolve("./test/specimens/externals.css")
        })
        .then((result) => {
            console.log(result.opts.files);
            console.log(result.messages[0]);
            console.log(result.css);
        })
        .catch(console.error.bind(console));
    });
});
