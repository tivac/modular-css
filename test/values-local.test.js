"use strict";

var assert = require("assert"),

    plugin = require("../src/plugins/values-local");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("/plugins", function() {
    describe("/values-local.js", function() {
        it("should silently ignore invalid declarations", function() {
            assert.doesNotThrow(function() {
                css("@value green");
            });
            
            assert.doesNotThrow(function() {
                css("@value red:");
            });
            
            assert.doesNotThrow(function() {
                css("@value blue red");
            });
        });

        it("should noop if no @value rules are defined", function() {
            assert.equal(
                css(".wooga { color: red; }"),
                ".wooga { color: red; }"
            );
        });

        it("should replace values in declarations", function() {
            assert.equal(
                css("@value color: red; .wooga { color: color; }"),
                ".wooga { color: red; }"
            );
        });

        it("should replace values in media queries", function() {
            assert.equal(
                css("@value small: (max-width: 599px); @media small { .wooga { color: red; } }"),
                "@media (max-width: 599px) { .wooga { color: red; } }"
            );
        });

        it("should support multiple values", function() {
            assert.equal(
                css("@value color: red; @value 2color: blue; .wooga { color: color; background: 2color; }"),
                ".wooga { color: red; background: blue; }"
            );
        });

        it("should support multiple values in a single declaration", function() {
            assert.equal(
                css("@value color: red; @value 2color: blue; .wooga { background: linear-gradient(color, 2color); }"),
                ".wooga { background: linear-gradient(red, blue); }"
            );
        });

        it("should support complex values", function() {
            assert.equal(
                css("@value base: 10px; @value large: calc(base * 2); .wooga { margin: large; }"),
                ".wooga { margin: calc(10px * 2); }"
            );
        });
        
        it("should support values containing commas", function() {
            assert.equal(
                css("@value fonts: -apple-system, '.SFNSText-Regular', 'San Francisco', 'Oxygen', 'Ubuntu', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif; .wooga { font-family: fonts; }"),
                ".wooga { font-family: -apple-system, '.SFNSText-Regular', 'San Francisco', 'Oxygen', 'Ubuntu', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif; }"
            );
        });

        it("should support value heirarchies", function() {
            assert.equal(
                css("@value color: red; @value 2color: color; .wooga { color: 2color; }"),
                ".wooga { color: red; }"
            );

            assert.equal(
                css("@value color: red; @value 2color: color; @value 3color: 2color; .wooga { color: 3color; }"),
                ".wooga { color: red; }"
            );
        });
        
        it("should output correct sourcemaps", function() {
            var result = plugin.process("@value color: red; .wooga { color: color; }", { map : true });
            
            assert.equal(
                result.css,
                ".wooga { color: red; }\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjxpbnB1dCBjc3MgMzg+Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFtQixTQUFuQixXQUFrQixFQUF5QiIsImZpbGUiOiJ0by5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJAdmFsdWUgY29sb3I6IHJlZDsgLndvb2dhIHsgY29sb3I6IGNvbG9yOyB9Il19 */");
        });

        it("should output exported values in a message", function() {
            var messages = plugin.process(
                    "@value color: red; @value 2color: color; @value other: 20px;"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].values, {
                "2color" : "red",
                color    : "red",
                other    : "20px"
            });
            assert.equal(typeof messages[0].sources, "object");
        });
    });
});
