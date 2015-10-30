"use strict";

var fs = require("fs"),

    postcss = require("postcss");

postcss([
    require("./plugins/values.js"),
    require("./plugins/scoping.js"),
    require("./plugins/composition.js")
])
.process(fs.readFileSync(process.argv[2], { encoding: "utf8" }))
.then(console.log.bind(console), console.log.bind(console));
