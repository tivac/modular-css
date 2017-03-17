"use strict";

var fs     = require("fs"),
    
    postcss = require("postcss"),
    read    = require("test-utils/read.js")(__dirname),
    namer   = require("test-utils/namer.js"),
    
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
            .then((result) => expect(result.css).toMatchSnapshot());
    });

    it("should process CSS with dependencies and output the result", function() {
        return process("./packages/postcss/test/specimens/start.css")
            .then((result) => expect(result.css).toMatchSnapshot());
    });

    it("should process CSS and output exports as a message", function() {
        return process("./packages/postcss/test/specimens/simple.css")
            .then((result) => expect(result.messages).toMatchSnapshot());
    });

    it("should accept normal processor options", function() {
        return process("./packages/postcss/test/specimens/simple.css", {
            map : {
                inline : true
            },
            namer : (f, s) => `fooga_${s}`
        })
        .then((result) => expect(result.css).toMatchSnapshot());
    });

    it("should accept a `json` property and write exports to that file", function() {
        return process(
            "./packages/postcss/test/specimens/start.css",
            {
                json : "./packages/postcss/test/output/classes.json"
            }
        )
        .then(() => expect(read("classes.json")).toMatchSnapshot());
    });

    it("should be usable like a normal postcss plugin", function() {
        var processor = postcss([
                plugin({
                    namer : () => "a"
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
        .then((result) => expect(result.css).toMatchSnapshot());
    });

    it("should output json when used within postcss", function() {
        var processor = postcss([
                plugin({
                    namer
                })
            ]);
        
        return processor.process(
            fs.readFileSync("./packages/postcss/test/specimens/simple.css"),
            {
                from : "./packages/postcss/test/specimens/simple.css",
                json : "./packages/postcss/test/output/simple.json"
            }
        )
        .then(() => compare.results("simple.json"));
    });

    it("should accept json args in either position with postcss", function() {
        var processor = postcss([
            plugin({
                namer,
                json : "./packages/postcss/test/output/simple.json"
            })
        ]);
        
        return processor.process(
            fs.readFileSync("./packages/postcss/test/specimens/simple.css"),
            {
                from : "./packages/postcss/test/specimens/simple.css"
            }
        )
        .then(() => compare.results("simple.json"));
    });
});
