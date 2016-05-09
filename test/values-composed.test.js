"use strict";

var path   = require("path"),
    assert = require("assert"),
    
    plugin = require("../src/plugins/values-composed"),
    local  = require("../src/plugins/values-local");

function css(src, options) {
    return plugin.process(src, options).css;
}

function files(values) {
    var out = {};
    
    out[path.resolve("./test/specimens/local.css")] = {
        values : values || {}
    };
    
    return out;
}

describe("/plugins", function() {
    describe("/values-composed.js", function() {
        it("should fail to parse invalid declarations", function() {
            assert.throws(function() {
                css("@value red from './local.css");
            }, /Unclosed quote/);
            
            assert.throws(function() {
                css("@value blue from ");
            }, /Invalid value composition/);
        });

        it("should fail if imports are referenced without having been parsed", function() {
            assert.throws(function() {
                css("@value booga from \"./local.css\";", {
                    from : "./test/specimens/no.css"
                });
            }, /Invalid file reference: booga from "\.\/local\.css"/);
        });

        it("should fail if importing from a file that doesn't exist", function() {
            assert.throws(function() {
                css("@value booga from \"./no.css\";", {
                    from  : path.resolve("./test/specimens/start.css"),
                    files : files()
                });
            }, /Unable to locate/);
        });

        it("should fail if non-existant imports are referenced", function() {
            assert.throws(function() {
                css("@value googa from \"./local.css\";", {
                    from  : path.resolve("./test/specimens/wooga.css"),
                    files : files()
                });
            }, /Invalid @value reference: googa/);
        });

        it("should support importing values from other files", function() {
            var imported = local.process("@value googa: red;");
            
            assert.equal(
                css("@value googa from \"./local.css\"; .wooga { color: googa; }", {
                    from  : path.resolve("./test/specimens/wooga.css"),
                    files : files(imported.messages[0].values)
                }),
                ".wooga { color: red; }"
            );
        });
        
        it("should support source maps", function() {
            var imported = local.process("@value googa: red;", { map : true });
            
            assert.equal(
                css("@value googa from \"./local.css\"; .wooga { color: googa; }", {
                    map   : true,
                    from  : path.resolve("./test/specimens/wooga.css"),
                    files : files(imported.messages[0].values)
                }),
                ".wooga { color: red; }\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3Qvc3BlY2ltZW5zL3dvb2dhLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBaUMsU0FBakMsV0FBZ0MsRUFBeUIiLCJmaWxlIjoidGVzdC9zcGVjaW1lbnMvd29vZ2EuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiQHZhbHVlIGdvb2dhIGZyb20gXCIuL2xvY2FsLmNzc1wiOyAud29vZ2EgeyBjb2xvcjogZ29vZ2E7IH0iXX0= */"
            );
        });
    });
});
