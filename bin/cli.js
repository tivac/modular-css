#!/usr/bin/env node
"use strict";

var fs = require("fs"),
    
    glob = require("../src/glob"),

    argv = require("minimist")(process.argv.slice(2), {
        alias : {
            map : "m",
            out : "o",
            dir : "d"
        },

        string  : [ "dir", "out" ],
        boolean : [ "map", "help" ],

        default : {
            map  : false,
            out  : false,
            help : false
        }
    });

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
        if(!argv.out) {
            return process.stdout.write(output.css + "\n");
        }

        return fs.writeFileSync(argv.out, output.css, "utf8");
    });
}());