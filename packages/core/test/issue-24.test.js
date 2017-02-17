"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    leading = require("dentist").dedent,

    Processor = require("../src/processor.js");

describe("/issues", function() {
    describe("/24", function() {
        it("should be able to compose using a value", function() {
            var processor = new Processor();
            
            return processor.string(
                "./test/specimens/composition.css",
                leading(`
                    @value simple: "./simple.css";
                    
                    .wooga {
                        composes: wooga from simple;
                        background: #000;
                    }
                `)
            )
            .then((result) => {
                assert.deepEqual(result.exports, {
                    wooga : [
                        "mc08e91a5b_wooga",
                        "mc29d531c6_wooga"
                    ]
                });

                return processor.output();
            })
            .then((result) =>
                assert.equal(
                    result.css,
                    leading(`
                        /* test/specimens/simple.css */
                        .mc08e91a5b_wooga {
                            color: red
                        }
                        /* test/specimens/composition.css */
                        .mc29d531c6_wooga {
                            background: #000
                        }
                    `)
                )
            );
        });
    });
});
