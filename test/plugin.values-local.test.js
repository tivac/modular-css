"use strict";

var assert = require("assert"),
    
    plugin = require("../src/plugins/values-local");

describe("/plugins", function() {
    describe("/values-local.js", function() {
        it("should complain about invalid declarations", function() {
            assert.throws(
                () => plugin.process("@value red:").css,
                /SyntaxError: /
            );
            
            assert.throws(
                () => plugin.process("@value blue red").css,
                /SyntaxError: /
            );
        });

        it("should remove value declarations from output", function() {
            assert.equal(
                plugin.process("@value red: #F00").css,
                ""
            );

            assert.equal(
                plugin.process("@value red: #F00; @value blue: blue;").css,
                ""
            );

            assert.equal(
                plugin.process("@value red: #F00; .wooga { color: red; }").css,
                ".wooga { color: red; }"
            );
        });
        
        it("should emit a message with details about values", function() {
            var msg = plugin.process("@value red: #F00; @value blue: blue;").messages[0];
            
            assert.equal(msg.plugin, "postcss-modular-css-values-local");
            assert.equal(msg.type, "modularcss");
            assert.equal(msg.values.blue.value, "blue");
            assert.equal(msg.values.red.value, "#F00");
        });

        it("should ignore non-local values", function() {
            assert.equal(
                plugin.process(`@value red from "./fooga.css";`).css,
                `@value red from "./fooga.css";`
            );

            assert.equal(
                plugin.process(`@value red from "./fooga.css"; .fooga { color: red; }`).css,
                `@value red from "./fooga.css"; .fooga { color: red; }`
            );
        });
    });
});
