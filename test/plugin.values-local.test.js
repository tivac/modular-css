"use strict";

var assert = require("assert"),
    
    plugin  = require("../src/plugins/values-local.js"),
    message = require("../src/lib/message.js"),
    
    processor = require("./lib/postcss.js")([ plugin ]);

describe("/plugins", function() {
    describe("/values-local.js", function() {
        it("should ignore invalid declarations in normal mode", function() {
            assert.doesNotThrow(() => processor.process("@value red:").css);
            assert.doesNotThrow(() => processor.process("@value blue red").css);
        });
        
        it("should complain about invalid declarations in strict mode", function() {
            assert.throws(
                () => processor.process("@value red:", { strict : true }).css,
                /SyntaxError: /
            );
            
            assert.throws(
                () => processor.process("@value blue red", { strict : true }).css,
                /SyntaxError: /
            );
        });

        it("should remove value declarations from output", function() {
            assert.equal(
                processor.process("@value red: #F00").css,
                ""
            );

            assert.equal(
                processor.process("@value red: #F00; @value blue: blue;").css,
                ""
            );

            assert.equal(
                processor.process("@value red: #F00; .wooga { color: red; }").css,
                ".wooga { color: red; }"
            );
        });
        
        it("should emit a message with details about values", function() {
            var result = processor.process("@value red: #F00; @value blue: blue;"),
                msg    = message(result, "values");
                
            assert.equal(
                msg.red.value,
                "#F00"
            );

            assert.equal(
                msg.blue.value,
                "blue"
            );
        });

        it("should ignore non-local values", function() {
            assert.equal(
                processor.process(`@value red from "./fooga.css";`).css,
                `@value red from "./fooga.css";`
            );

            assert.equal(
                processor.process(`@value red from "./fooga.css"; .fooga { color: red; }`).css,
                `@value red from "./fooga.css"; .fooga { color: red; }`
            );
        });
    });
});
