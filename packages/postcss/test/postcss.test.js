"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    postcss = require("postcss"),
    compare = require("test-utils/compare.js")(__dirname),
    namer   = require("test-utils/namer.js"),
    
    message = require("modular-css-core/lib/message.js"),

    plugin  = require("../postcss.js");

function process(file, opts) {
    return plugin.process(
        fs.readFileSync(file),
        Object.assign(
            Object.create(null),
            {
                from : file,
                namer
            },
            opts || {}
        )
    );
}

describe("/postcss.js", function() {
    afterAll(() => require("shelljs").rm("-rf", "./packages/postcss/test/output/*"));
    
    it("should be a function", function() {
        expect(typeof plugin).toBe("function");
    });

    it("should process CSS and output the result", function() {
        return process("./packages/postcss/test/specimens/simple.css")
            .then((result) =>
                compare.stringToFile(
                    result.css,
                    "./packages/postcss/test/results/simple.css"
                )
            );
    });

    it("should process CSS with dependencies and output the result", function() {
        return process("./packages/postcss/test/specimens/start.css")
            .then((result) =>
                compare.stringToFile(
                    result.css,
                    "./packages/postcss/test/results/start.css"
                )
            );
    });

    it("should process CSS and output exports as a message", function() {
        return process("./packages/postcss/test/specimens/simple.css")
            .then((result) => assert.deepEqual(
                message(result, (msg) => msg.type === "modular-css-exports", "exports"),
                {
                    wooga : [ "wooga" ]
                }
            ));
    });

    it("should accept normal processor options", function() {
        return process("./packages/postcss/test/specimens/simple.css", {
            map : {
                inline : true
            },
            namer : (f, s) => `fooga_${s}`
        })
        .then((result) =>
            compare.stringToFile(
                result.css,
                "./packages/postcss/test/results/simple-namer.css"
            )
        );
    });

    it("should accept a `json` property and write exports to that file", function() {
        return process(
            "./packages/postcss/test/specimens/start.css",
            {
                json : "./packages/postcss/test/output/classes.json"
            }
        )
        .then(() => compare.results("classes.json"));
    });

    it("should be usable like a normal postcss plugin", function() {
        var processor = postcss([
                plugin({
                    namer : (f, s) => `fooga_${s}`
                })
            ]);
        
        return processor.process(
            fs.readFileSync("./packages/postcss/test/specimens/simple.css"),
            {
                from : "./packages/postcss/test/specimens/simple.css",
                map  : {
                    inline : true
                }
            }
        )
        .then((result) =>
            compare.stringToFile(
                result.css,
                "./packages/postcss/test/results/simple-namer.css"
            )
        );
    });
});
