"use strict";

var assert = require("assert"),

    postcss = require("postcss"),
    
    scoping     = require("../src/plugins/scoping"),
    composition = require("../src/plugins/composition");

function msg(compositions) {
    return {
        type   : "modularcss",
        plugin : "postcss-modular-css-composition",
        
        compositions : compositions
    };
}

describe("postcss-modular-css", function() {
    describe("composition plugin", function() {
        it("should fail if attempting to compose a class that doesn't exist", function() {
            /* eslint no-unused-expressions:0 */
            var out = composition.process(".wooga { composes: googa; }");
            
            assert.throws(function() {
                out.css;
            }, /Invalid rule reference/);
        });
        
        it("should fail if composes isn't the first rule", function() {
            var out = composition.process(".wooga { color: red; composes: googa; }");
            
            assert.throws(function() {
                out.css;
            }, /composes must be the first declaration in the rule/);
        });
        
        it("should fail if classes have a cyclic dependency", function() {
            var out = composition.process(".wooga { composes: booga; } .booga { composes: wooga; }");
            
            assert.throws(function() {
                out.css;
            }, /Dependency Cycle Found: wooga -> booga -> wooga/);
        });

        it("should fail if imports are referenced without having been parsed", function() {
            var out = composition.process(".wooga { composes: booga from \"./local.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {}
                });
            
            assert.throws(function() {
                out.css;
            }, /Invalid file reference/);
        });

        it("should fail if composing from a file that doesn't exist", function() {
            var out = composition.process(".wooga { composes: googa from \"./fooga.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {}
                });
            
            assert.throws(function() {
                out.css;
            }, /Unable to resolve/);
        });

        it("should fail if non-existant imports are referenced", function() {
            var out = composition.process(".wooga { composes: googa from \"./local.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {
                        "test/specimens/local.css" : {
                            compositions : {}
                        }
                    }
                });
            
            assert.throws(function() {
                out.css;
            }, /Invalid rule reference/);
        });
        
        it("should fail when parsing an invalid value", function() {
            var out;

            out = composition.process(".wooga { composes: global(); }");
            
            assert.throws(function() {
                out.css;
            }, /Unable to parse rule/);

            out = composition.process(".wooga { composes: fooga wooga; }");
            
            assert.throws(function() {
                out.css;
            }, /Unable to parse rule/);
        });

        it("should output composition results as a message", function() {
            var messages = composition.process(".wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.deepEqual(messages, [ msg({
                wooga : [ "wooga" ],
                fooga : [ "wooga" ]
            }) ]);
        });

        it("should remove classes that only contain a composes rule from the output CSS", function() {
            assert.equal(
                composition.process(".wooga { color: red; } .fooga { composes: wooga; }").css,
                ".wooga { color: red; }"
            );
        });
        
        it("should output removed classes as part of a message", function() {
            var messages = composition.process(".wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 1);
            assert("fooga" in messages[0].compositions);
            assert.equal(messages[0].compositions.fooga[0], "wooga");
        });

        it("should support IDs instead of classes", function() {
            var messages = composition.process("#wooga { color: red; } .fooga { composes: wooga; }").messages;
            
            assert.equal(messages.length, 1);
            assert("fooga" in messages[0].compositions);
            assert.equal(messages[0].compositions.fooga[0], "wooga");
        });
        
        it("should output the class hierarchy in a message", function() {
            var out = composition.process(
                    ".wooga { color: red; } .booga { background: blue; } #tooga { composes: booga, wooga; }"
                );
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [
                    "booga",
                    "wooga"
                ]
            }) ]);
        });
        
        it("should support composing against later classes", function() {
            var out = composition.process(".wooga { composes: booga; } .booga { color: red; }");
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "booga" ],
                booga : [ "booga" ]
            }) ]);
        });

        it("should allow multiple composes declarations", function() {
            var out = composition.process(".wooga { } .booga { } .tooga { composes: wooga; composes: booga; }");

            assert.deepEqual(out.messages, [ msg({
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [ "wooga", "booga" ]
            }) ]);
        });
        
        it("should support composing against global identifiers", function() {
            var out;

            out = composition.process(".wooga { composes: global(booga); }");
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "booga" ]
            }) ]);

            out = composition.process(".wooga { composes: global(booga), global(tooga); }");
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "booga", "tooga" ]
            }) ]);

            out = composition.process(".wooga { composes: global(booga); color: red; }");
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "booga", "wooga" ]
            }) ]);

            out = composition.process(".tooga { } .wooga { composes: global(booga), tooga; }");
            
            assert.deepEqual(out.messages, [ msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga" ]
            }) ]);

            out = composition.process(".tooga { } .wooga { composes: global(booga), tooga; color: red; }");
            
            assert.deepEqual(out.messages, [ msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            }) ]);

            out = composition.process(".tooga { } .wooga { composes: global(booga); composes: tooga; }");
            
            assert.deepEqual(out.messages, [ msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga" ]
            }) ]);

            out = composition.process(".tooga { } .wooga { composes: global(booga); composes: tooga; color: red; }");
            
            assert.deepEqual(out.messages, [ msg({
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            }) ]);
        });
        
        it("should dedupe repeated dependencies", function() {
            var out = composition.process(
                    ".wooga { color: red; } .booga { composes: wooga; } .tooga { composes: booga; }"
                );
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "wooga" ],
                booga : [ "wooga" ],
                tooga : [ "wooga" ]
            }) ]);
        });
        
        it("should handle multi-level dependencies", function() {
            var out = composition.process(
                    ".wooga { color: red; } .booga { composes: wooga; background: blue; } .tooga { composes: booga; display: block; }"
                );
            
            assert.deepEqual(out.messages, [ msg({
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
            }) ]);
        });
        
        it("should handle multi-level dependencies with empty elements", function() {
            var out = composition.process(
                    ".wooga { color: red; } .booga { composes: wooga; } .tooga { composes: booga; }"
                );
            
            assert.deepEqual(out.messages, [ msg({
                wooga : [ "wooga" ],
                booga : [ "wooga" ],
                tooga : [ "wooga" ]
            }) ]);
        });
        
        it("should find scoped identifiers from the scoping plugin's message", function() {
            var out = postcss([ scoping, composition ]).process(".wooga { color: red; } .googa { composes: wooga; }");
            
            assert.deepEqual(out.messages, [ {
                type    : "modularcss",
                plugin  : "postcss-modular-css-scoping",
                classes : {
                    googa : "7277eb6cdd9ca80332ddd1cd83af7935_googa",
                    wooga : "7277eb6cdd9ca80332ddd1cd83af7935_wooga"
                }
            }, msg({
                googa : [ "7277eb6cdd9ca80332ddd1cd83af7935_wooga" ],
                wooga : [ "7277eb6cdd9ca80332ddd1cd83af7935_wooga" ]
            }) ]);
        });
        
        it("should ignore messages that aren't from the scoping plugin", function() {
            var plugin = postcss.plugin("fake-plugin", function() {
                    return function(css, result) {
                        result.messages.push({
                            type   : "modularcss",
                            plugin : "fake-plugin"
                        });
                    };
                }),
            
                out = postcss([ plugin, composition ]).process(".wooga { color: red; } .googa { composes: wooga; }");
                
            assert.deepEqual(out.messages, [ {
                type   : "modularcss",
                plugin : "fake-plugin"
            }, msg({
                googa : [ "wooga" ],
                wooga : [ "wooga" ]
            }) ]);
        });

        it("should compose multiple classes from imports", function() {
            var out = composition.process(".wooga { composes: googa, tooga from \"./local.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {
                        "test/specimens/local.css" : {
                            compositions : {
                                googa : [ "googa" ],
                                tooga : [ "tooga" ]
                            }
                        }
                    }
                });

            assert.deepEqual(out.messages, [ msg({
                wooga : [ "googa", "tooga" ]
            }) ]);
        });

        it("should expose imported heirachy details in the messages", function() {
            var out = composition.process(".wooga { composes: googa from \"./local.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {
                        "test/specimens/local.css" : {
                            compositions : {
                                googa : [ "googa" ]
                            }
                        }
                    }
                });

            assert.deepEqual(out.messages, [ msg({
                wooga : [ "googa" ]
            }) ]);
        });
    });
});
