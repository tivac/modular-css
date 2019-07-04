"use strict";

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const peg = require("pegjs");

const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);

const dest = path.resolve(__dirname, "../packages/processor/parsers/");
const shared = fs.readFileSync(require.resolve("./shared.pegjs"));
const files = [
    require.resolve("./at-composes.pegjs"),
    require.resolve("./composes.pegjs"),
    require.resolve("./external.pegjs"),
    require.resolve("./values.pegjs"),
];

const generate = async () => {

    await Promise.all(
        files.map(async (file) => {
            const grammar = await read(file, "utf8");
    
            const parser = peg.generate(`${shared}\n${grammar}`, {
                output            : "source",
                format            : "commonjs",
                allowedStartRules : [ "start" ],
                optimize          : "speed",
            });

            const { name } = path.parse(file);
    
            await write(path.join(dest, `${name}.js`), parser);
        })
    );
};

generate();
