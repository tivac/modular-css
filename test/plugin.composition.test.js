"use strict";

var path   = require("path"),
    assert = require("assert"),

    postcss = require("./lib/postcss.js"),
    
    scoping     = require("../src/plugins/scoping.js"),
    composition = require("../src/plugins/composition.js"),
    message     = require("../src/lib/message.js");

function namer(file, selector) {
    return file ? `${path.basename(file, path.extname(file))}_${selector}` : selector;
}

describe("/plugins", function() {
    describe("/composition.js", function() {
        beforeEach(function() {
            var processor = postcss([ scoping, composition ]);
            
            this.process = (css, opts) =>
                processor.process(css, Object.assign(
                    Object.create(null),
                    { namer : namer },
                    opts
                ));
            
            this.classes = (css, opts) =>
                message(
                    this.process(css, opts),
                    (msg) => msg.plugin === composition.postcssPlugin,
                    "classes"
                );
        });
        
        it("should fail if attempting to compose a class that doesn't exist", function() {
            assert.throws(() =>
                this.process(".wooga { composes: googa; }").css,
                /Invalid composes reference/
            );
        });
        
        it("should fail if composes isn't the first rule", function() {
            assert.throws(() =>
                this.process(".wooga { color: red; composes: googa; }").css,
                /composes must be the first declaration/
            );
        });
        
        it("should fail if classes have a cyclic dependency", function() {
            assert.throws(() =>
                this.process(".wooga { composes: booga; } .booga { composes: wooga; }").css,
                /Dependency Cycle Found: wooga -> booga -> wooga/
            );
        });

        it("should fail if imports are referenced without having been parsed", function() {
            assert.throws(() =>
                this.classes(".wooga { composes: booga from \"./local.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {}
                }).css,
                /Invalid file reference/
            );
        });

        it("should fail if composing from a file that doesn't exist", function() {
            assert.throws(() =>
                this.process(".wooga { composes: googa from \"./fooga.css\"; }", {
                    from  : "test/specimens/wooga.css",
                    files : {}
                }).css,
                /Unable to locate/
            );
        });

        it("should fail if non-existant imports are referenced", function() {
            assert.throws(() =>
                this.process(".wooga { composes: googa from \"./local.css\"; }", {
                    from  : path.resolve("./test/specimens/wooga.css"),
                    files : {
                        [path.resolve("./test/specimens/local.css")] : {
                            exports : {}
                        }
                    }
                }).css,
                /Invalid composes reference/
            );
        });
        
        it("should fail when parsing an invalid value", function() {
            assert.throws(() =>
                this.process(".wooga { composes: global(); }").css,
                /SyntaxError: Expected/
            );
            
            assert.throws(() =>
                this.process(".wooga { composes: fooga wooga; }").css,
                /SyntaxError: Expected/
            );
        });

        it("should output composition results as a message", function() {
            var classes = this.classes(".wooga { color: red; } .fooga { composes: wooga; }");

            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "wooga" ],
                fooga : [ "wooga", "fooga" ]
            });
        });

        it("should remove classes that only contain a composes rule from the output CSS", function() {
            assert.equal(
                this.process(".wooga { color: red; } .fooga { composes: wooga; }").css,
                ".wooga { color: red; }"
            );
        });
        
        it("should output removed classes as part of a message", function() {
            var classes = this.classes(".wooga { color: red; } .fooga { composes: wooga; }");
            
            assert(classes);
            assert("fooga" in classes);
            assert.equal(classes.fooga[0], "wooga");
        });

        it("should support IDs instead of classes", function() {
            var classes = this.classes("#wooga { color: red; } .fooga { composes: wooga; }");
            
            assert(classes);
            assert("fooga" in classes);
            assert.equal(classes.fooga[0], "wooga");
        });
        
        it("should output the class hierarchy in a message", function() {
            var classes = this.classes(
                    ".wooga { color: red; } .booga { background: blue; } #tooga { composes: booga, wooga; }"
                );
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [ "booga", "wooga", "tooga" ]
            });
        });
        
        it("should support composing against later classes", function() {
            var classes = this.classes(".wooga { composes: booga; } .booga { color: red; }");
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "booga", "wooga" ],
                booga : [ "booga" ]
            });
        });

        it("should allow multiple composes declarations", function() {
            var classes = this.classes(".wooga { } .booga { } .tooga { composes: wooga; composes: booga; }");
        
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "wooga" ],
                booga : [ "booga" ],
                tooga : [ "wooga", "booga", "tooga" ]
            });
        });
        
        it("should support composing against global identifiers", function() {
            var classes = this.classes(".wooga { composes: global(booga); }");
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "booga", "wooga" ]
            });

            classes = this.classes(".wooga { composes: global(booga), global(tooga); }");
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "booga", "tooga", "wooga" ]
            });

            classes = this.classes(".wooga { composes: global(booga); color: red; }");
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "booga", "wooga" ]
            });

            classes = this.classes(".tooga { } .wooga { composes: global(booga), tooga; }");
            
            assert(classes);
            assert.deepEqual(classes, {
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            });

            classes = this.classes(".tooga { } .wooga { composes: global(booga), tooga; color: red; }");
            
            assert(classes);
            assert.deepEqual(classes, {
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            });

            classes = this.classes(".tooga { } .wooga { composes: global(booga); composes: tooga; }");
            
            assert(classes);
            assert.deepEqual(classes, {
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            });

            classes = this.classes(".tooga { } .wooga { composes: global(booga); composes: tooga; color: red; }");
            
            assert(classes);
            assert.deepEqual(classes, {
                tooga : [ "tooga" ],
                wooga : [ "booga", "tooga", "wooga" ]
            });
        });

        it("should support composing against global identifiers w/ the same name", function() {
            var classes = this.classes(".wooga { composes: global(wooga); color: red; }", {
                    from : "test/specimens/simple.css"
                });
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "wooga", "simple_wooga" ]
            });
        });
        
        it("should handle multi-level dependencies", function() {
            var classes = this.classes(
                    ".wooga { color: red; } .booga { composes: wooga; background: blue; } .tooga { composes: booga; display: block; }"
                );
            
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [ "wooga" ],
                booga : [ "wooga", "booga" ],
                tooga : [ "wooga", "booga", "tooga" ]
            });
        });
        
        it("should find scoped identifiers from the scoping plugin's message", function() {
            var out = this.process(
                    ".wooga { color: red; } .googa { composes: wooga; }",
                    {
                        from  : "test/specimens/simple.css",
                        namer : (file, selector) =>
                            path.basename(file, path.extname(file)) + "_" + selector
                    }
                );
            
            assert.deepEqual(
                message(out, (msg) => msg.plugin === scoping.postcssPlugin, "classes"),
                {
                    googa : [ "simple_googa" ],
                    wooga : [ "simple_wooga" ]
                }
            );
            
            assert.deepEqual(
                message(out, (msg) => msg.plugin === composition.postcssPlugin, "classes"),
                {
                    googa : [ "simple_wooga", "simple_googa" ],
                    wooga : [ "simple_wooga" ]
                }
            );
        });
        
        it("should compose multiple classes from imports", function() {
            var classes = this.classes(".wooga { composes: googa, tooga from \"./local.css\"; }", {
                from  : path.resolve("./test/specimens/wooga.css"),
                files : {
                    [path.resolve("./test/specimens/local.css")] : {
                        exports : {
                            googa : [ "local_googa" ],
                            tooga : [ "local_tooga" ]
                        }
                    }
                }
            });
        
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [
                    "local_googa",
                    "local_tooga",
                    "wooga_wooga"
                ]
            });
        });

        it("should expose imported heirachy details in the messages", function() {
            var classes = this.classes(".wooga { composes: googa from \"./local.css\"; }", {
                from  : path.resolve("./test/specimens/wooga.css"),
                files : {
                    [path.resolve("./test/specimens/local.css")] : {
                        exports : {
                            googa : [ "local_googa" ],
                            tooga : [ "local_tooga" ]
                        }
                    }
                }
            });
        
            assert(classes);
            assert.deepEqual(classes, {
                wooga : [
                    "local_googa",
                    "wooga_wooga"
                ]
            });
        });
    });
});
