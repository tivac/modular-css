"use strict";

var assert = require("assert"),
    
    plugin = require("../src/plugins/values-local");

describe("/plugins", function() {
    describe("/values-local.js", function() {
        var process;
        
        beforeEach(function() {
            process = function(css, options) {
                return plugin.process(css, Object.assign({
                    files : {
                        "test.css" : {}
                    },
                    from : "test.css"
                }, options));
            };
        });
        
        it("should silently ignore invalid declarations", function() {
            /* eslint no-unused-expressions:0 */
            
            assert.doesNotThrow(function() {
                process("@value green").css;
            });
            
            assert.doesNotThrow(function() {
                process("@value red:").css;
            });
            
            assert.doesNotThrow(function() {
                process("@value blue red").css;
            });
        });

        it("should noop if no @value rules are defined", function() {
            assert.equal(
                process(".wooga { color: red; }").css,
                ".wooga { color: red; }"
            );
        });

        it("should replace values in declarations", function() {
            assert.equal(
                process("@value color: red; .wooga { color: color; }").css,
                ".wooga { color: red; }"
            );
        });

        it("should replace value references in @value declarations", function() {
            assert.equal(
                process("@value color: red; @value value: color; .wooga { color: value; }").css,
                ".wooga { color: red; }"
            );
        });

        it("should replace values in media queries", function() {
            assert.equal(
                process(
                    "@value small: (max-width: 599px);" +
                    "@media small { .wooga { color: red; } }" +
                    "@media (max-width: 799px) { .wooga { color: red; } }"
                ).css,
                "@media (max-width: 599px) { .wooga { color: red; } }" +
                "@media (max-width: 799px) { .wooga { color: red; } }"
            );
        });

        it("should support multiple values", function() {
            assert.equal(
                process("@value color: red; @value 2color: blue; .wooga { color: color; background: 2color; }").css,
                ".wooga { color: red; background: blue; }"
            );
        });

        it("should support multiple values in a single declaration", function() {
            assert.equal(
                process("@value color: red; @value 2color: blue; .wooga { background: linear-gradient(color, 2color); }").css,
                ".wooga { background: linear-gradient(red, blue); }"
            );
        });

        it("should support complex values", function() {
            assert.equal(
                process("@value base: 10px; @value large: calc(base * 2); .wooga { margin: large; }").css,
                ".wooga { margin: calc(10px * 2); }"
            );
        });
        
        it("should support values containing commas", function() {
            assert.equal(
                process("@value fonts: -apple-system, '.SFNSText-Regular', 'San Francisco', 'Oxygen', 'Ubuntu', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif; .wooga { font-family: fonts; }").css,
                ".wooga { font-family: -apple-system, '.SFNSText-Regular', 'San Francisco', 'Oxygen', 'Ubuntu', 'Roboto', 'Segoe UI', 'Helvetica Neue', 'Lucida Grande', sans-serif; }"
            );
        });

        it("should support value heirarchies", function() {
            assert.equal(
                process("@value color: red; @value 2color: color; .wooga { color: 2color; }").css,
                ".wooga { color: red; }"
            );

            assert.equal(
                process("@value color: red; @value 2color: color; @value 3color: 2color; .wooga { color: 3color; }").css,
                ".wooga { color: red; }"
            );
        });
        
        it("should output correct sourcemaps", function() {
            assert.equal(
                process(
                    "@value color: red; .wooga { color: color; }",
                    { map : true, from : "test.css", to : "out.css" }
                ).css,
                ".wooga { color: red; }\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFtQixTQUFuQixXQUFrQixFQUF5QiIsImZpbGUiOiJvdXQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiQHZhbHVlIGNvbG9yOiByZWQ7IC53b29nYSB7IGNvbG9yOiBjb2xvcjsgfSJdfQ== */");
        });

        it("should write exported values to the files object", function() {
            var files = {
                    "test.css" : {}
                };
                
            plugin.process(
                "@value color: red; @value 2color: color; @value other: 20px;",
                {
                    files : files,
                    from  : "test.css"
                }
            ).css;
            
            assert.deepEqual(files["test.css"].values, {
                "2color" : "red",
                color    : "red",
                other    : "20px"
            });
        });
    });
});
