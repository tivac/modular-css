"use strict";

var fs      = require("fs"),
    path    = require("path"),
    assert  = require("assert"),
    
    plugin = require("../src/plugin.js"),
    
    exported = require("./lib/exported.js"),
    compare  = require("./lib/compare.js"),
    warn     = require("./lib/warn.js");

describe("/plugin.js", function() {
    it("should be a postcss plugin", function() {
        assert.equal(typeof plugin, "function");
        assert.equal(typeof plugin.process, "function");
    });
        
    it("should fail if a value imports a non-existant reference", function() {
        return plugin.process(
            "@value not-real from \"../local.css\";",
            { from : "./invalid/value.css" }
        )
        .catch((error) => assert(error.message.indexOf(`Unable to locate "../local.css" from`) === 0));
    });
    
    it("should fail if a composition imports a non-existant reference", function() {
        return plugin.process(
            ".wooga { composes: fake from \"../local.css\"; }",
            { from : "./invalid/composition.css" }
        )
        .catch((error) => assert(error.message.indexOf(`Unable to locate "../local.css" from`) === 0));
    });

    it("should scope classes, ids, and keyframes", function() {
        return plugin.process(
            "@keyframes kooga { } #fooga { } .wooga { }",
            { from : "./test/specimens/simple.css" }
        )
        .then((result) => {
            assert.deepEqual(exported(result).exports, {
                "test/specimens/simple.css" : {
                    fooga : "mc08e91a5b_fooga",
                    wooga : "mc08e91a5b_wooga"
                }
            });

            compare.stringToFile(result.css, "./test/results/processor/scoping.css");
        });
    });

    it("should support local values in value composition", function() {
        return plugin.process(
            "@value local: './local.css'; @value one from local; .fooga { background: one; }",
            { from : "./test/specimens/values.css" }
        )
        .then((result) => assert.deepEqual(exported(result).exports, {
            "test/specimens/folder/folder.css": {
                folder : "mc04bb002b_folder"
            },
            "test/specimens/local.css": {
                booga : "mc04cb4cb2_booga",
                looga : "mc04cb4cb2_booga mc04cb4cb2_looga"
            },
            "test/specimens/values.css": {
                fooga : "mcf3094811_fooga"
            }
        }));
    });

    it("should support local values in composition", function() {
        return plugin.process(
            "@value simple: './simple.css'; .fooga { composes: wooga from simple; }",
            { from : "./test/specimens/values.css" }
        )
        .then((result) => assert.deepEqual(exported(result).exports, {
            "test/specimens/simple.css": {
                wooga : "mc08e91a5b_wooga"
            },
            "test/specimens/values.css": {
                fooga : "mc08e91a5b_wooga mcf3094811_fooga"
            }
        }));
    });

    it("should support overriding external values", function() {
        return plugin.process(
            fs.readFileSync("./test/specimens/externals.css", "utf8"),
            { from : "./test/specimens/externals.css" }
        )
        .then((result) => compare.stringToFile(result.css, "./test/results/processor/externals.css"));
    });

    it("should add a message containing compositions", function() {
        return plugin.process(
            ".fooga { color: red; } .booga { background: #000; } .tooga { composes: fooga, booga; }",
            { from : "./test/specimens/simple.css" }
        )
        .then((result) => assert.deepEqual(exported(result).exports, {
            "test/specimens/simple.css" : {
                fooga : "mc08e91a5b_fooga",
                booga : "mc08e91a5b_booga",
                tooga : "mc08e91a5b_fooga mc08e91a5b_booga mc08e91a5b_tooga"
            }
        }))
        .catch((e) => {
            throw e;
        })
    });

    it("should export identifiers and their classes", function() {
        return plugin.process(
            fs.readFileSync("./test/specimens/start.css", "utf8"),
            { from : "./test/specimens/start.css" }
        )
        .then((result) => {
            assert.deepEqual(exported(result).exports, {
                "test/specimens/folder/folder.css" : {
                    folder : "mc04bb002b_folder"
                },
                "test/specimens/local.css" : {
                    booga : "mc04cb4cb2_booga",
                    looga : "mc04cb4cb2_booga mc04cb4cb2_looga"
                },
                "test/specimens/start.css" : {
                    booga : "mc61f0515a_booga",
                    tooga : "mc61f0515a_tooga",
                    wooga : "mc04cb4cb2_booga mc61f0515a_wooga"
                }
            });

            compare.stringToFile(result.css, "./test/results/processor/start.css");
        });
    });

    it("should support unicode classes & ids", function() {
        return plugin.process(
            fs.readFileSync("./test/specimens/processor/unicode.css", "utf8"),
            {
                from  : "./test/specimens/processor/unicode.css",
                namer : (file, selector) => selector
            }
        )
        .then((result) => compare.stringToFile(result.css, "./test/results/processor/unicode.css"));
    });
});
