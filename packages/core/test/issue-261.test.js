"use strict";

var Processor = require("../processor.js");

describe("/issues", function() {
    describe("/261", function() {
        it("should allow colons in rules that also use :external()", function() {
            var processor = new Processor();
            
            return processor.file("./packages/core/test/specimens/issues/261/2.css")
            .then(() => processor.output())
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
