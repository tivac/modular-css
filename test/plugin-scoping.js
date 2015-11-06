var assert = require("assert"),
    plugin = require("../src/plugins/scoping");

function css(src, options) {
    return plugin.process(src, options).css;
}

describe("postcss-modular-css", function() {
    describe("scoping", function() {
        it("should generate a prefix for class names", function() {
            assert.equal(
                css(".wooga { color: red; }"),
                ".83fe1a59eebdf17220df583a8e9048da_wooga { color: red; }"
            );
        });
        
        it("should generate a prefix for ids", function() {
            assert.equal(
                css("#wooga { color: red; }"),
                "#5dde9181034d498d7163570eea1e3987_wooga { color: red; }"
            );
        });
        
        it("should ignore non-class/non-id selectors", function() {
            assert.equal(
                css("p { color: red; }"),
                "p { color: red; }"
            );
        });

        it("should remove :global() from non-class/non-id selectors", function() {
            assert.equal(
                css(":global(p) { color: red; }"),
                "p { color: red; }"
            );
        });
        
        it("should only transform class/id selectors", function() {
            assert.equal(
                css("#wooga p { color: red; }"),
                "#b350f25893cfee96ec24f2e48e73349e_wooga p { color: red; }"
            );
            
            assert.equal(
                css("#wooga .booga { color: red; }"),
                "#bf6193cc71ecb94fb202e8fea1df388a_wooga .bf6193cc71ecb94fb202e8fea1df388a_booga { color: red; }"
            );

            assert.equal(
                css("#wooga { color: red; } #wooga:hover { color: blue; }"),
                "#134c0871e7c8220eca018a7499dc4bc4_wooga { color: red; } #134c0871e7c8220eca018a7499dc4bc4_wooga:hover { color: blue; }"
            );
        });
        
        it("should transform selectors within media queries", function() {
            assert.equal(
                css("@media (max-width: 100px) { .booga { color: red; } }"),
                "@media (max-width: 100px) { .1c058ba8c40ce27eb8eef0ed1d5ef09a_booga { color: red; } }"
            );
        });
        
        it("shouldn't transform global selectors", function() {
            assert.equal(
                css(":global(.wooga) { color: red; }"),
                ".wooga { color: red; }"
            );
            
            assert.equal(
                css(":global(#wooga) { color: red; }"),
                "#wooga { color: red; }"
            );
            
            assert.equal(
                css("@media (max-width: 100px) { :global(.booga) { color: red; } }"),
                "@media (max-width: 100px) { .booga { color: red; } }"
            );
        });
        
        it("should support mixed local & global selectors", function() {
            assert.equal(
                css(":global(#wooga), .wooga { color: red; }"),
                "#wooga, .0161606ae727b8d0466e905957eca53c_wooga { color: red; }"
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
            assert.equal(messages[0].type, "modularcss");
            assert.equal(messages[0].plugin, "postcss-modular-css-scoping");
            
            assert.deepEqual(messages[0].classes, { wooga : "83fe1a59eebdf17220df583a8e9048da_wooga" });
        });
    });
});
