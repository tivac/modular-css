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
});
