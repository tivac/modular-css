"use strict";

var dedent = require("dedent"),
    namer  = require("@modular-css/test-utils/namer.js"),
    
    Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/98", () => {
        it("should prune rules that only compose, but leave them in the exports", () => {
            var processor = new Processor({
                    namer,
                });
            
            return processor.string(
                "./packages/processor/test/specimens/issues/98.css",
                dedent(`
                    .booga { color: red }
                    .fooga { composes: booga }
                    .fooga + .fooga { color: blue }
                `)
            )
            .then((result) => {
                expect(result.exports).toMatchSnapshot();

                return processor.output();
            })
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
