"use strict";

var assert = require("assert"),
    
    plugin = require("../src/plugin.js"),
    
    compositions = require("./lib/compositions.js"),
    compare      = require("./lib/compare-files.js");

describe("/issues", function() {
    describe("/98", function() {
        it("should prune rules that only compose, but leave them in the exports", function() {
            return plugin.process(
                require("fs").readFileSync("./test/specimens/issues/98.css", "utf8"),
                { from : "./test/specimens/issues/98.css" }
            )
            .then((result) => {
                assert.deepEqual(
                    compositions(result),
                    {
                        "test/specimens/issues/98.css" : {
                            booga : "mc2a6c9ee9_booga",
                            fooga : "mc2a6c9ee9_booga mc2a6c9ee9_fooga"
                        }
                    }
                );

                compare.stringToFile(result.css, "./test/results/issues/98.css");
            });
        });
    });
});
