"use strict";

var assert = require("assert"),
    
    plugin = require("../src/plugins/values-local");

describe("/plugins", function() {
    describe.only("/values-local.js", function() {
        it("should silently ignore invalid declarations", function() {
            /* eslint no-unused-expressions:0 */
            
            assert.doesNotThrow(function() {
                plugin.process("@value green").css;
            });
            
            assert.doesNotThrow(function() {
                plugin.process("@value red:").css;
            });
            
            assert.doesNotThrow(function() {
                plugin.process("@value blue red").css;
            });
        });

        it("should remove value declarations from output");
        it("should emit a message with details about values");
        it("should ignore non-local values");
    });
});
