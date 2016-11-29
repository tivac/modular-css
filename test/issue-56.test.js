"use strict";

var assert = require("assert"),
    
    plugin = require("../src/plugin.js"),

    compositions = require("./lib/compositions.js"),
    compare      = require("./lib/compare-files.js");

describe("/issues", function() {
    describe("/56", function() {
        it("should prune rules that only compose, but leave them in the exports", function() {
            return plugin.process(
                    require("fs").readFileSync("./test/specimens/issues/56.css", "utf8"),
                    { from : "./test/specimens/issues/56.css" }
            )
            .then((result) => {
                assert.deepEqual(compositions(result), {
                    "test/specimens/issues/56.css" : {
                        booga : "mc13e7db14_booga",
                        fooga : "mc13e7db14_booga mc13e7db14_fooga",
                        wooga : "mc13e7db14_booga mc13e7db14_wooga"
                    }
                });

                compare.stringToFile(result.css, "./test/results/issues/56.css");
            });
        });
    });
});
