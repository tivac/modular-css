#!/usr/bin/env node
"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    mkdirp = require("mkdirp"),
    
    Processor = require("../src/processor"),
    output    = require("../src/_output"),
    
    processor = new Processor({ map : true }),
    
    src = process.argv[2],
    out = process.argv[3];

// Update checking
require("update-notifier")({ pkg : require("../package.json" ) }).notify({ defer : true });

processor.file(src).then(function() {
    return processor.output({ to : out });
})
.then(function(result) {
    /* eslint no-console:0 */
    if(!out) {
        return console.log(result.css);
    }
    
    mkdirp.sync(path.dirname(out));
    
    fs.writeFileSync(out, result.css);
    
    return fs.writeFileSync(
        path.basename(out, path.extname(out)) + ".json",
        JSON.stringify(output.compositions(process.cwd(), processor), null, 4)
    );
})
.catch(function(error) {
    console.log("Error!", error.stack);
});
