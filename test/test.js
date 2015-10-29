var assert = require("assert"),
    plugin = require("../");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-css-modules", function() {
    describe("class name rewriting", function() {
        it("should generate a prefix for class names", function() {
            assert.equal(
                css(".wooga { color: red; }"),
                ".83fe1a59eebdf17220df583a8e9048da_wooga { color: red; }"
            );
        });
        
        it("should use a supplied string prefix for class names", function() {
            assert.equal(
                css(".wooga { color: red; }", { prefix : "tooga" }),
                ".tooga_wooga { color: red; }"
            );
        });
        
        it("should call a naming function for class names", function() {
            assert.equal(
                css(".wooga { color: red; }", {
                    namer : function(selector) {
                        return "googa_" + selector;
                    }
                }),
                ".googa_wooga { color: red; }"
            );
        });
        
        it("should expose original classname in a message", function() {
            var messages = plugin.process(".wooga { color: red; }").messages;
            
            assert.equal(messages.length, 1);
            assert.equal(messages[0].type, "cssmodules");
            assert.equal(messages[0].plugin, "postcss-css-modules");
            
            assert.deepEqual(messages[0].classes, { ".wooga" : [ ".83fe1a59eebdf17220df583a8e9048da_wooga" ] });
        });
    });
    
    describe("composition", function() {
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
                ".fe6ec05fbaecf633eb3bb3197f2f4ffd_wooga { color: red; }"
            );
        });
        
        it("should output removed classes as part of a message", function() {
            var messages = plugin.process(".wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 1);
            assert(".fooga" in messages[0].classes);
            assert.equal(messages[0].classes[".fooga"][0], ".fe6ec05fbaecf633eb3bb3197f2f4ffd_wooga");
        });
        
        it("should output the class heirarchy in a message", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { background: blue; } .tooga { composes: booga wooga; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                ".wooga" : [ ".dc76c9780ea5a534c9d7ee437d35dd21_wooga" ],
                ".booga" : [ ".dc76c9780ea5a534c9d7ee437d35dd21_booga" ],
                ".tooga" : [
                    ".dc76c9780ea5a534c9d7ee437d35dd21_wooga",
                    ".dc76c9780ea5a534c9d7ee437d35dd21_booga"
                ]
            });
        });
        
        it("should support composing against later classes", function() {
            var messages = plugin.process(".wooga { composes: booga; } .booga { color: red; }").messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                ".wooga" : [ ".22ae97ec1ad01f3434bf11b63f6a6bff_booga" ],
                ".booga" : [ ".22ae97ec1ad01f3434bf11b63f6a6bff_booga" ]
            });
        });
        
        it("should dedupe repeated dependencies", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { composes: wooga; } .tooga { composes: booga; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                ".wooga" : [ ".a71b8d58846fb229a55bf284f51ee555_wooga" ],
                ".booga" : [ ".a71b8d58846fb229a55bf284f51ee555_wooga" ],
                ".tooga" : [ ".a71b8d58846fb229a55bf284f51ee555_wooga" ]
            });
        });
        
        it("should handle multi-level dependencies", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { composes: wooga; background: blue; } .tooga { composes: booga; display: block; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                ".wooga" : [ ".859d4ed7215a17c424b857f3306693e0_wooga" ],
                ".booga" : [
                    ".859d4ed7215a17c424b857f3306693e0_wooga",
                    ".859d4ed7215a17c424b857f3306693e0_booga"
                ],
                ".tooga" : [
                    ".859d4ed7215a17c424b857f3306693e0_wooga",
                    ".859d4ed7215a17c424b857f3306693e0_booga",
                    ".859d4ed7215a17c424b857f3306693e0_tooga"
                ]
            });
        });
        
        it("should handle multi-level dependencies with empty elements", function() {
            var messages = plugin.process(
                    ".wooga { color: red; } .booga { composes: wooga; } .tooga { composes: booga; }"
                ).messages;
            
            assert.equal(messages.length, 1);
            assert.deepEqual(messages[0].classes, {
                ".wooga" : [ ".a71b8d58846fb229a55bf284f51ee555_wooga" ],
                ".booga" : [ ".a71b8d58846fb229a55bf284f51ee555_wooga" ],
                ".tooga" : [ ".a71b8d58846fb229a55bf284f51ee555_wooga" ]
            });
        });
    });
});
