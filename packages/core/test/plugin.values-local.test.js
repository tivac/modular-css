"use strict";

var assert = require("assert"),
    
    plugin = require("../plugins/values-local.js"),
    
    processor = require("postcss")([ plugin ]);

describe("/plugins", function() {
    describe("/values-local.js", function() {
        it("should ignore invalid declarations in normal mode", function() {
            expect(() => processor.process("@value red:").css).not.toThrow();
            expect(() => processor.process("@value blue red").css).not.toThrow();
        });
        
        it("should complain about invalid declarations in strict mode", function() {
            expect(
                () => processor.process("@value red:", { strict : true }).css
            )
            .toThrow(/SyntaxError: /);
            
            expect(
                () => processor.process("@value blue red", { strict : true }).css
            )
            .toThrow(/SyntaxError: /);
        });

        it("should remove value declarations from output", function() {
            expect(
                processor.process("@value red: #F00").css
            )
            .toMatchSnapshot();

            expect(
                processor.process("@value red: #F00; @value blue: blue;").css
            )
            .toMatchSnapshot();

            expect(
                processor.process("@value red: #F00; .wooga { color: red; }").css
            )
            .toMatchSnapshot();
        });
        
        it("should emit a message with details about values", function() {
            expect(
                processor.process("@value red: #F00; @value blue: blue;").messages
            )
            .toMatchSnapshot();
        });

        it("should ignore non-local values", function() {
            expect(
                processor.process(`@value red from "./fooga.css";`).css
            )
            .toMatchSnapshot();

            expect(
                processor.process(`@value red from "./fooga.css"; .fooga { color: red; }`).css
            )
            .toMatchSnapshot();
        });
    });
});
