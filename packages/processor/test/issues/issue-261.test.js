"use strict";

const Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/261", () => {
        it("should allow colons in rules that also use :external()", () => {
            const processor = new Processor();
            
            return processor.file(require.resolve("./specimens/261/2.css"))
            .then(() => processor.output())
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
