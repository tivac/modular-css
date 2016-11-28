#!/usr/bin/env node
"use strict";

var fs = require("fs"),
    path = require("path"),
    
    mkdirp = require("mkdirp"),

    glob = require("../src/glob"),

    argv = require("minimist")(process.argv.slice(2), {
        alias : {
            dir  : "d",
            json : "j",
            map  : "m",
            out  : "o"
        },

        string  : [ "dir", "out", "json" ],
        boolean : [ "map", "help" ],

        default : {
            dir  : false,
            json : false,
            map  : false,
            out  : false,
            help : false
        }
    });

// wrapped so I can early-return in the help case
(function() {
    if(argv.help) {
        return fs.createReadStream("./bin/help.txt", "utf8").pipe(process.stdout);
    }

    // aliasing this manually
    argv.search = argv._;

    return glob(argv).then(function(processor) {
        return processor.output({
            to : argv.out
        });
    })
    .then(function(output) {
        if(argv.json) {
            mkdirp.sync(path.dirname(argv.json));
            
            fs.writeFileSync(
                argv.json,
                JSON.stringify(output.compositions, null, 4),
                "utf8"
            );
        }

        if(argv.out) {
            mkdirp.sync(path.dirname(argv.out));
            
            return fs.writeFileSync(argv.out, output.css, "utf8");
        }

        return process.stdout.write(output.css + "\n");
    })
    .catch((err) => process.stderr.write(err.toString));
}());
