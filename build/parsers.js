"use strict";

var fs = require("fs"),
    
    peg   = require("pegjs"),
    shell = require("shelljs"),
    
    helpers = fs.readFileSync("./src/parsers/_helpers.pegjs", "utf8");

shell.ls("./src/parsers/*.pegjs")
    .filter((thing) => thing.indexOf("_helpers.pegjs") === -1)
    .map((name) => ({ name, src : fs.readFileSync(name, "utf8").replace("// HELPERS //", helpers) }))
    .forEach((file) => {
        var parser = peg.generate(file.src, {
                output : "source",
                format : "commonjs"
            });

        fs.writeFileSync(
            file.name.replace(".pegjs", ".parser.js"),
            parser
        );
    });
