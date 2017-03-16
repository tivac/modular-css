#!/usr/bin/env node
"use strict";

var fs   = require("fs"),
    path = require("path"),
    
    mkdirp = require("mkdirp"),
    glob = require("modular-css-glob"),
    cli = require("meow")(`
        Usage
        $ modular-css [options] <glob>...

        Options
        --dir,  -d <dir>    Directory to search from [process cwd]
        --out,  -o <file>   File to write output CSS to [stdout]
        --json, -j <file>   File to write output compositions JSON to
        --map,  -m          Include inline source map in output
        --help              Show this help
    `, {
        alias : {
            dir  : "d",
            json : "j",
            map  : "m",
            out  : "o"
        },

        string  : [ "dir", "out", "json" ],
        boolean : [ "map", "help" ]
    });

// It's not immediately obvious, but this ends the program too...
if(!cli.input.length) {
    cli.showHelp();
}

glob(Object.assign(
    Object.create(null),
    cli.flags,
    { search : cli.input }
))
.then((processor) => processor.output({ to : cli.flags.out }))
.then((output) => {
    if(cli.flags.json) {
        mkdirp.sync(path.dirname(cli.flags.json));
        
        fs.writeFileSync(
            cli.flags.json,
            JSON.stringify(output.compositions, null, 4),
            "utf8"
        );
    }

    if(cli.flags.out) {
        mkdirp.sync(path.dirname(cli.flags.out));
        
        return fs.writeFileSync(cli.flags.out, output.css, "utf8");
    }

    return process.stdout.write(`${output.css}\n`);
})
.catch((error) => {
    process.stderr.write(error.toString());

    process.exit(1);
});
