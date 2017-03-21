"use strict";

var message = require("../lib/message.js");

describe("/lib", function() {
    describe("/message.js", function() {
        it("should find the last message containing a given field", function() {
            expect(
                message({ messages : [
                    { fooga : { aooga : "aooga" } },
                    { fooga : { booga : "booga" } },
                    { fooga : { cooga : "cooga" } }
                ] }, "fooga")
            )
            .toMatchSnapshot();
        });
        
        it("should return an empty object if a message wasn't found", function() {
            expect(
                message({ messages : [
                    { fooga : { aooga : "aooga" } },
                    { fooga : { booga : "booga" } },
                    { fooga : { cooga : "cooga" } }
                ] }, "booga")
            )
            .toMatchSnapshot();
        });
    });
});
