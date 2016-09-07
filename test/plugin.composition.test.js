"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("postcss"),
    assign  = require("lodash.assign"),
    
    scoping     = require("../src/plugins/scoping"),
    composition = require("../src/plugins/composition");

function msg(classes) {
    return {
        type    : "modularcss",
        plugin  : "postcss-modular-css-composition",
        classes : classes
    };
}

describe("/plugins", function() {
    describe("/composition.js", function() {
        var process;
        
        beforeEach(function() {
            var processor = postcss([ scoping, composition ]);
            
            process = function(css, opts) {
                return processor.process(css, assign({
                    namer : function(file, selector) {
                        return file ? path.basename(file, path.extname(file)) + "_" + selector : selector;
                    }
                }, opts));
            };
        });
        
        it("should fail if attempting to compose a class that doesn't exist", function() {
            /* eslint no-unused-expressions:0 */
            var out = process(".wooga { composes: googa; }");
            
            assert.throws(function() {
                out.css;
            }, /Invalid composes reference/);
        });
        
        it("should fail if composes isn't the first rule", function() {
            var out = process(".wooga { color: red; composes: googa; }");
            
            assert.throws(function() {
                out.css;
            }, /composes must be the first declaration in the rule/);
        });
        
        it("should fail if classes have a cyclic dependency", function() {
            var out = process(".wooga { composes: booga; } .booga { composes: wooga; }");
            
            assert.throws(function() {
                out.css;
            }, /Dependency Cycle Found: wooga -> booga -> wooga/);
        });

        it("should fail if imports are referenced without having been parsed", function() {
            var out = process(".wooga { composes: booga from \"./local.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {}
                });
            
            assert.throws(function() {
                out.css;
            }, /Invalid file reference/);
        });

        it("should fail if composing from a file that doesn't exist", function() {
            var out = process(".wooga { composes: googa from \"./fooga.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {}
                });
            
            assert.throws(function() {
                out.css;
            }, /Unable to locate/);
        });

        it("should fail if non-existant imports are referenced", function() {
            var files = {},
                out;
                
            files[path.resolve("./test/specimens/local.css")] = {
                exports : {}
            };
            
            out = process(".wooga { composes: googa from \"./local.css\"; }", {
                from  : path.resolve("./test/specimens/wooga.css"),
                files : files
            });
            
            assert.throws(function() {
                out.css;
            }, /Invalid composes reference/);
        });
        
        it("should fail when parsing an invalid value", function() {
            var out;

            out = process(".wooga { composes: global(); }");
            
            assert.throws(function() {
                out.css;
            }, /Unable to parse composition/);

            out = process(".wooga { composes: fooga wooga; }");
            
            assert.throws(function() {
                out.css;
            }, /Unable to parse composition/);
        });

        it("should output composition results as a message", function() {
            var messages = process(".wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 2);
            assert.deepEqual(messages[1], msg({
                wooga : [ "wooga" ],
                fooga : [ "wooga", "fooga" ]
            }));
        });

        it("should remove classes that only contain a composes rule from the output CSS", function() {
            assert.equal(
                process(".wooga { color: red; } .fooga { composes: wooga; }").css,
                ".wooga { color: red; }"
            );
        });
        
        it("should output removed classes as part of a message", function() {
            var messages = process(".wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 2);
            assert("fooga" in messages[1].classes);
            assert.equal(messages[1].classes.fooga[0], "wooga");
        });

        it("should support IDs instead of classes", function() {
            var messages = process("#wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 2);
            assert("fooga" in messages[1].classes);
            assert.equal(messages[1].classes.fooga[0], "wooga");
        });
        
        it("should output the class hierarchy in a message", function() {
            var out = process(
                    ".wooga { color: red; } .booga { background: blue; } #tooga { composes: booga, wooga; }"
                );
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [ "booga", "wooga", "tooga" ]
            }));
        });
        
        it("should support composing against later classes", function() {
            var out = process(".wooga { composes: booga; } .booga { color: red; }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "booga", "wooga" ],
                booga : [ "booga" ]
            }));
        });

        it("should allow multiple composes declarations", function() {
            var out = process(".wooga { } .booga { } .tooga { composes: wooga; composes: booga; }");
        
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [ "wooga", "booga", "tooga" ]
            }));
        });
        
        it("should support composing against global identifiers", function() {
            var out;

            out = process(".wooga { composes: global(booga); }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "booga", "wooga" ]
            }));

            out = process(".wooga { composes: global(booga), global(tooga); }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "booga", "tooga", "wooga" ]
            }));

            out = process(".wooga { composes: global(booga); color: red; }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "booga", "wooga" ]
            }));

            out = process(".tooga { } .wooga { composes: global(booga), tooga; }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            }));

            out = process(".tooga { } .wooga { composes: global(booga), tooga; color: red; }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            }));

            out = process(".tooga { } .wooga { composes: global(booga); composes: tooga; }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            }));

            out = process(".tooga { } .wooga { composes: global(booga); composes: tooga; color: red; }");
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            }));
        });

        it("should support composing against global identifiers w/ the same name", () => {
            var out = process(".wooga { composes: global(wooga); color: red; }", {
                    from : "test/specimens/simple.css"
                });
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "wooga", "simple_wooga" ]
            }));
        });
        
        it("should handle multi-level dependencies", function() {
            var out = process(
                    ".wooga { color: red; } .booga { composes: wooga; background: blue; } .tooga { composes: booga; display: block; }"
                );
            
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [ "wooga" ],
                booga : [ "wooga", "booga" ],
                tooga : [ "wooga", "booga", "tooga" ]
            }));
        });
        
        it("should find scoped identifiers from the scoping plugin's message", function() {
            var out = process(
                    ".wooga { color: red; } .googa { composes: wooga; }",
                    {
                        from  : "test/specimens/simple.css",
                        namer : function(file, selector) {
                            return path.basename(file, path.extname(file)) + "_" + selector;
                        }
                    }
                );
            
            assert.deepEqual(out.messages, [ {
                type    : "modularcss",
                plugin  : "postcss-modular-css-scoping",
                classes : {
                    googa : [ "simple_googa" ],
                    wooga : [ "simple_wooga" ]
                }
            }, msg({
                googa : [ "simple_wooga", "simple_googa" ],
                wooga : [ "simple_wooga" ]
            }) ]);
        });
        
        it("should compose multiple classes from imports", function() {
            var files = {},
                out;
                
            files[path.resolve("./test/specimens/local.css")] = {
                exports : {
                    googa : [ "local_googa" ],
                    tooga : [ "local_tooga" ]
                }
            };
            
            out = process(".wooga { composes: googa, tooga from \"./local.css\"; }", {
                from  : path.resolve("./test/specimens/wooga.css"),
                files : files
            });
        
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [
                    "local_googa",
                    "local_tooga",
                    "wooga_wooga"
                ]
            }));
        });

        it("should expose imported heirachy details in the messages", function() {
            var files = {},
                out;
                
            files[path.resolve("./test/specimens/local.css")] = {
                exports : {
                    googa : [ "local_googa" ],
                    tooga : [ "local_tooga" ]
                }
            };
            
            out = process(".wooga { composes: googa from \"./local.css\"; }", {
                from  : path.resolve("./test/specimens/wooga.css"),
                files : files
            });
        
            assert.equal(out.messages.length, 2);
            assert.deepEqual(out.messages[1], msg({
                wooga : [
                    "local_googa",
                    "wooga_wooga"
                ]
            }));
        });
    });
});
