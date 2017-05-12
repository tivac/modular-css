"use strict";

var Processor = require("../../processor.js");

describe("/issues", function() {
    describe("/261", function() {
        it("should allow colons in rules that also use :external()", function() {
            var processor = new Processor();
            
            return processor.file(require.resolve("./specimens/261/2.css"))
            .then(() => processor.output())
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
