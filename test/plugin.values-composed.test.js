"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    assign = require("lodash.assign"),
    
    plugin = require("../src/plugins/values-composed");

describe("/plugins", function() {
    describe("/values-composed.js", function() {
        /* eslint no-unused-expressions:0 */
        var process;
        
        beforeEach(function() {
            process = function(css, options, values) {
                var files = {};
                
                // Composition source
                files[path.resolve("./test/specimens/local.css")] = {
                    values : values || {}
                };
                
                // Composition target
                files[path.resolve("./test/specimens/start.css")] = {};
                
                return plugin.process(css, assign({
                    files : files,
                    from  : path.resolve("./test/specimens/start.css")
                }, options || {}));
            };
        });
        
        it("should fail to parse invalid declarations", function() {
            assert.throws(function() {
                process("@value red from './local.css").css;
            }, /Unclosed quote/);
            
            assert.throws(function() {
                process("@value blue from ").css;
            }, /Unable to parse composition/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            assert.throws(function() {
                process("@value booga from \"./no.css\";").css;
            }, /Unable to locate/);
        });

        it("should fail if non-existant imports are referenced", function() {
            assert.throws(function() {
                process("@value booga from \"./local.css\";").css;
            }, /Invalid @value reference: booga/);
            
            assert.throws(function() {
                process("@value googa from \"./local.css\";", false, { fooga : "fooga" }).css;
            }, /Invalid @value reference: googa/);
        });

        it("should support importing values from other files", function() {
            assert.equal(
                process("@value googa from \"./local.css\"; .wooga { color: googa; }", false, { googa : "red" }).css,
                ".wooga { color: red; }"
            );
        });
        
        it("should support source maps", function() {
            assert.equal(
                process("@value googa from \"./local.css\"; .wooga { color: googa; }", {
                    map : true
                }, {
                    googa : "red"
                }).css,
                ".wooga { color: red; }\n" +
                "/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3Qvc3BlY2ltZW5zL3N0YXJ0LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBaUMsU0FBakMsV0FBZ0MsRUFBeUIiLCJmaWxlIjoidGVzdC9zcGVjaW1lbnMvc3RhcnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiQHZhbHVlIGdvb2dhIGZyb20gXCIuL2xvY2FsLmNzc1wiOyAud29vZ2EgeyBjb2xvcjogZ29vZ2E7IH0iXX0= */"
            );
        });
    });
});
