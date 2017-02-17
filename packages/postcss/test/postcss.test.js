"use strict";

var fs     = require("fs"),
    path   = require("path"),
    assert = require("assert"),
    
    postcss = require("postcss"),
    compare = require("test-utils/compare.js"),
    message = require("modular-css-core/lib/message.js"),

    plugin  = require("../postcss.js");

function process(file, opts) {
    return plugin.process(
        fs.readFileSync(file),
        Object.assign(
            Object.create(null),
            {
                from : file
            },
            opts || {}
        )
    );
}

describe("/postcss.js", function() {
    after(() => require("shelljs").rm("-rf", "./test/output/postcss"));
    
    it("should be a function", function() {
        assert.equal(typeof plugin, "function");
    });

    it("should process CSS and output the result", function() {
        return process("./test/specimens/simple.css")
            .then((result) => compare.stringToFile(result.css, "./test/results/postcss/simple.css"));
    });

    it("should process CSS with dependencies and output the result", function() {
        return process("./test/specimens/start.css")
            .then((result) => compare.stringToFile(result.css, "./test/results/postcss/start.css"));
    });

    it("should process CSS and output exports as a message", function() {
        return process("./test/specimens/simple.css")
            .then((result) => assert.deepEqual(
                message(result, (msg) => msg.type === "modular-css-exports", "exports"),
                {
                    wooga : [ "mc08e91a5b_wooga" ]
                }
            ));
    });

    it("should accept normal processor options", function() {
        return process("./test/specimens/simple.css", {
            map   : {
                inline : true
            },
            namer : (f, s) => `fooga_${s}`
        })
        .then((result) => compare.stringToFile(result.css, "./test/results/postcss/simple-namer.css"));
    });

    it("should accept a `json` property and write exports to that file", function() {
        return process("./test/specimens/start.css", { json : "./test/output/postcss/classes.json" })
            .then(() => compare.results("postcss/classes.json"));
    });

    it("should be usable like a normal postcss plugin", function() {
        var processor = postcss([
                plugin({
                    json  : "./test/output/postcss/classes.json",
                    map   : {
                        inline : true
                    },
                    namer : (f, s) => `fooga_${s}`
                })
            ]);
        
        processor.process(fs.readFileSync("./test/specimens/start.css"), { from : "./test/specimens/start.css" })
            .then((result) => compare.stringToFile(resut.css, "./test/results/postcss/simple-namer.cs"));
    });
});
