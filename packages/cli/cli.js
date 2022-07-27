#!/usr/bin/env node
/* eslint-disable no-console -- CLIs can write to console! */
"use strict";

const fs   = require("fs");
const path = require("path");

const mkdirp = require("mkdirp");
const glob = require("@modular-css/glob");
const output = require("@modular-css/processor/lib/output.js");

const cli = require("meow")(`
    Usage
    $ modular-css [options] <glob>...

    Options
    --dir,     -d <dir>    Directory to search from [process cwd]
    --out,     -o <file>   File to write output CSS to [stdout]
    --json,    -j <file>   File to write output compositions JSON to
    --map,     -m          Include inline source map in output
    --rewrite, -r          Control rewriting of url() references in CSS
    --help                 Show this help
`, {
    alias : {
        dir     : "d",
        json    : "j",
        map     : "m",
        out     : "o",
        rewrite : "r",
    },

    default : {
        rewrite : true,
    },

    string  : [ "dir", "out", "json" ],
    boolean : [ "map", "rewrite", "help" ],
});

// It's not immediately obvious, but this ends the program too...
if(!cli.input.length) {
    cli.showHelp();
}

glob({
    __proto__ : null,

    ...cli.flags,
    
    search : cli.input,
})
.then((processor) => processor.output({ to : cli.flags.out }))
.then(({ compositions, css }) => {
    if(cli.flags.json) {
        mkdirp.sync(path.dirname(cli.flags.json));
        
        const json = output.json(compositions);

        fs.writeFileSync(
            cli.flags.json,
            JSON.stringify(json, null, 4),
            "utf8"
        );
    }

    if(cli.flags.out) {
        mkdirp.sync(path.dirname(cli.flags.out));
        
        return fs.writeFileSync(cli.flags.out, css, "utf8");
    }

    return process.stdout.write(`${css}\n`);
})
.catch((error) => {
    console.log(error);

    process.stderr.write(error.toString());

    process.exit(1);
});
