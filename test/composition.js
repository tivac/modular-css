var assert = require("assert"),
    plugin = require("../plugins/composition");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-css-modules", function() {
    describe.only("composition", function() {
        /* eslint no-unused-expressions:0 */
        it("should fail if attempting to compose a class that doesn't exist", function() {
            var out = plugin.process(".wooga { composes: googa; }");
            
            assert.throws(function() {
                out.css;
            });
        });
        
        it("should fail if composes isn't the first rule", function() {
            var out = plugin.process(".wooga { color: red; composes: googa; }");
            
            assert.throws(function() {
                out.css;
            });
        });
        
        it("should fail if classes have a cyclic dependency", function() {
            var out = plugin.process(".wooga { composes: booga; } .booga { composes: wooga; }");
            
            assert.throws(function() {
                out.css;
            });
        });
        
        it("should remove classes that only contain a composes rule", function() {
            assert.equal(
                css(".wooga { color: red; } .fooga { composes: wooga; }"),
                ".wooga { color: red; }"
            );
        });
        
        it("should output removed classes as part of a message", function() {
            var messages = plugin.process(".wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 1);
            assert("fooga" in messages[0].classes);
            assert.equal(messages[0].classes.fooga[0], "wooga");
        });
        
        it("should output the class heirarchy in a message", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { background: blue; } .tooga { composes: booga wooga; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [
                    "wooga",
                    "booga"
                ]
            });
        });
        
        it("should support composing against later classes", function() {
            var messages = plugin.process(".wooga { composes: booga; } .booga { color: red; }").messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                wooga : [ "booga" ],
                booga : [ "booga" ]
            });
        });
        
        it("should dedupe repeated dependencies", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { composes: wooga; } .tooga { composes: booga; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                wooga : [ "wooga" ],
                booga : [ "wooga" ],
                tooga : [ "wooga" ]
            });
        });
        
        it("should handle multi-level dependencies", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { composes: wooga; background: blue; } .tooga { composes: booga; display: block; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                wooga : [ "wooga" ],
                booga : [
                    "wooga",
                    "booga"
                ],
                tooga : [
                    "wooga",
                    "booga",
                    "tooga"
                ]
            });
        });
        
        it("should handle multi-level dependencies with empty elements", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { composes: wooga; } .tooga { composes: booga; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                wooga : [ "wooga" ],
                booga : [ "wooga" ],
                tooga : [ "wooga" ]
            });
        });
    });
});
