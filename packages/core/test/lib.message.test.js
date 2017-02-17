"use strict";

var assert = require("assert"),

    message   = require("../src/lib/message.js");

describe("/lib", function() {
    describe("/message.js", function() {
        it("should find the last message containing a given field", function() {
            assert.deepEqual(
                message({ messages : [
                    { fooga : { aooga : "aooga" } },
                    { fooga : { booga : "booga" } },
                    { fooga : { cooga : "cooga" } }
                ] }, "fooga"),
                { cooga : "cooga" }
            );
        });
        
        it("should return an empty object if a message wasn't found", function() {
            assert.deepEqual(
                message({ messages : [
                    { fooga : { aooga : "aooga" } },
                    { fooga : { booga : "booga" } },
                    { fooga : { cooga : "cooga" } }
                ] }, "booga"),
                { }
            );
        });
    });
});
