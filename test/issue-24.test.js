"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    plugin = require("../src/plugin.js"),
    
    exported = require("./lib/exported.js"),
    compare  = require("./lib/compare.js");

describe("/issues", function() {
    describe("/24", function() {
        it("should be able to compose using a value", function() {
            return plugin.process(
                require("fs").readFileSync("./test/specimens/issues/24.css", "utf8"),
                { from : "./test/specimens/issues/24.css" }
            )
            .then((result) => {
                assert.deepEqual(exported(result).exports, {
                    "test/specimens/issues/24.css" : {
                        wooga : "mc08e91a5b_wooga mcdd3d3520_wooga"
                    },
                    "test/specimens/simple.css" : {
                        wooga : "mc08e91a5b_wooga"
                    }
                });

                compare.stringToFile(result.css, "./test/results/issues/24.css");
            });
        });
    });
});
