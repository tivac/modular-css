"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    Processor = require("../src/processor");

describe("postcss-modular-css", function() {
    describe("processor", function() {
        beforeEach(function() {
            this.processor = new Processor();
        });
        
        it("should be a function", function() {
            assert.equal(typeof Processor, "function");
        });
        
        it("should process a string", function() {
            var result = this.processor.string("./test/specimens/simple.css", ".wooga { color: red; }");
            
            assert.deepEqual(result, {
                files : {
                    "test/specimens/simple.css" : {
                        text   : ".wooga { color: red; }",
                        parsed : ".83fe1a59eebdf17220df583a8e9048da_wooga { color: red; }",
                        
                        compositions : {
                            wooga : [ "83fe1a59eebdf17220df583a8e9048da_wooga" ]
                        }
                    }
                },
                exports : {
                    wooga : [ "83fe1a59eebdf17220df583a8e9048da_wooga" ]
                }
            });
        });

        it("should process a file", function() {
            var result = this.processor.file("./test/specimens/simple.css");
            
            assert.deepEqual(result, {
                files : {
                    "test/specimens/simple.css" : {
                        text   : fs.readFileSync("./test/specimens/simple.css", "utf8"),
                        parsed : ".1bc1718879cff9694b0f5cc8ad7b7537_wooga { color: red; }\n",
                        
                        compositions : {
                            wooga : [ "1bc1718879cff9694b0f5cc8ad7b7537_wooga" ]
                        }
                    }
                },
                exports : {
                    wooga : [ "1bc1718879cff9694b0f5cc8ad7b7537_wooga" ]
                }
            });
        });
        
        it("should walk dependencies into node_modules", function() {
            var result = this.processor.file("./test/specimens/node_modules.css");
            
            assert.deepEqual(result, {
                files : {
                    "test/specimens/node_modules.css" : {
                        text   : fs.readFileSync("./test/specimens/node_modules.css", "utf8"),
                        parsed : "\n",
                        
                        compositions : {
                            booga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ],
                            wooga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ]
                        }
                    },
                    "test/specimens/node_modules/styles/styles.css" : {
                        text   : ".wooga { color: white; }\n",
                        parsed : ".669ffa9d9ce988eb34ed75f927156773_wooga { color: white; }\n",
                        
                        compositions : {
                            wooga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ]
                        }
                    }
                },
                exports : {
                    booga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ],
                    wooga : [ "669ffa9d9ce988eb34ed75f927156773_wooga" ]
                }
            });
        });

        it("should export identifiers and their classes", function() {
            var result = this.processor.file("./test/specimens/start.css");
            
            assert.deepEqual(result, {
                files : {
                    "test/specimens/start.css" : {
                        text   : fs.readFileSync("./test/specimens/start.css", "utf8"),
                        parsed : ".aeacf0c6fbb2445f549ddc0fcfc1747b_booga { color: red; background: blue; }\n" +
                                 ".aeacf0c6fbb2445f549ddc0fcfc1747b_tooga { border: 1px solid white; }\n",
                        
                        values : {
                            folder : "white",
                            one    : "red",
                            two    : "blue"
                        },
                        
                        compositions : {
                            wooga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                            booga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_booga" ],
                            tooga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_tooga" ]
                        }
                    },
                    "test/specimens/local.css" : {
                        text   : fs.readFileSync("./test/specimens/local.css", "utf8"),
                        parsed : ".f5507abd3eea0987714c5d92c3230347_booga { background: green; }\n",
                        values : {
                            folder : "white",
                            one    : "red",
                            two    : "blue"
                        },
                        
                        compositions : {
                            booga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                            looga : [ "f5507abd3eea0987714c5d92c3230347_booga" ]
                        }
                    },
                    "test/specimens/folder/folder.css" : {
                        text   : fs.readFileSync("./test/specimens/folder/folder.css", "utf8"),
                        parsed : ".dafdfcc7dc876084d352519086f9e6e9_folder { margin: 2px; }\n",
                        values : {
                            folder : "white"
                        },
                        
                        compositions : {
                            folder : [ "dafdfcc7dc876084d352519086f9e6e9_folder" ]
                        }
                    }
                },
                
                exports : {
                    wooga : [ "f5507abd3eea0987714c5d92c3230347_booga" ],
                    booga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_booga" ],
                    tooga : [ "aeacf0c6fbb2445f549ddc0fcfc1747b_tooga" ]
                }
            });
        });

        it("should generate css representing the output from all added files", function() {
            this.processor.file("./test/specimens/start.css");
            this.processor.file("./test/specimens/node_modules.css");
            
            assert.equal(
                this.processor.css,
                fs.readFileSync("./test/results/processor-output-all.css", "utf8")
            );
        });

        it("should avoid duplicating files in the output", function() {
            this.processor.file("./test/specimens/start.css");
            this.processor.file("./test/specimens/local.css");
            
            assert.equal(
                this.processor.css,
                fs.readFileSync("./test/results/processor-avoid-duplicates.css", "utf8")
            );
        });
        
        describe("bad imports", function() {
            it("should fail if a value imports a non-existant reference", function() {
                var processor = this.processor;
                
                assert.throws(function() {
                    processor.string("./invalid/value.css", "@value not-real from \"../local.css\";");
                });
            });
            
            it("should fail if a composition imports a non-existant reference", function() {
                var processor = this.processor;
                
                assert.throws(function() {
                    processor.string("./invalid/composition.css", ".wooga { composes: fake from \"../local.css\"; }");
                });
            });
        });
    });
});
