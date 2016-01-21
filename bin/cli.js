#!/usr/bin/env node
"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    mkdirp = require("mkdirp"),
    map    = require("lodash.mapValues"),
    
    Processor = require("../").Processor,

    processor;
    
// Update checking
require("update-notifier")({ pkg : require("../package.json" ) }).notify({ defer : true });

processor = new Processor();

processor.file(process.argv[2]).then(function() {
    /* eslint no-console:0 */
    var file = process.argv[3],
        css  = processor.css();
    
    if(!file) {
        return console.log(css);
    }

    mkdirp.sync(path.dirname(file));

    fs.writeFileSync(file, css);
    fs.writeFileSync(
        path.basename(file, path.extname(file)) + ".json",
        JSON.stringify(map(processor.files, function(part) {
            return part.compositions;
        }), null, 4)
    );
});
