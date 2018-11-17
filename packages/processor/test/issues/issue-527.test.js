"use strict";

var Processor = require("../../processor.js");

describe("/issues", () => {
    describe("/527", () => {
        it("should catch incorrect case usage", () => {
            var processor = new Processor({ verbose : true });
            
            return processor.file(require.resolve("./specimens/527/casing.css"))
            .then(() => processor.output([ require.resolve("./specimens/527/casing.css") ]))
            .then((result) => expect(result.css).toMatchSnapshot());
        });
    });
});
