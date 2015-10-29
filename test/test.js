var assert = require("assert"),
    plugin = require("../");

function test(input, output, opts, done) {
    if(typeof opts === "function") {
        done = opts;
        opts = {};
    }

    plugin
    .process(input, opts)
    .then(function(result) {
        assert.equal(result.css, output);
        assert.equal(result.warnings().length, 0);
        
        done();
    })
    .catch(function(error) {
        done(error);
    });
}

describe("postcss-css-modules", function() {
    it("should blah?", function(done) {
        test(".wooga { color: red; } .fooga { composes: wooga; }", "", done);
    });
});
