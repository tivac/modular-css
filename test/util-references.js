"use strict";

var assert = require("assert"),

    postcss = require("postcss"),

    references = require("../src/_references");

describe("modular-css", function() {
    describe("util-references", function() {
        it("should export a function", function() {
            assert.equal(typeof references, "function");
        });

        it("should find messages from scoping plugin", function() {
            assert.deepEqual(
                references(null, {
                    messages : [ {
                        plugin  : "postcss-modular-css-scoping",
                        classes : {
                            fooga : [ "fooga" ]
                        }
                    } ]
                }),
                
                { fooga : [ "fooga" ] }
            );
        });
        
        it("should ignore messages from other plugins", function() {
            assert.deepEqual(
                references(null, {
                    messages : [ {
                        plugin  : "postcss-modular-css-composition",
                        classes : {
                            googa : [ "googa" ]
                        }
                    }, {
                        plugin  : "postcss-modular-css-scoping",
                        classes : {
                            fooga : [ "fooga" ]
                        }
                    } ]
                }),
                
                { fooga : [ "fooga" ] }
            );
        });
        
        it("should not return a reference to the message output", function() {
            var classes = {
                    fooga : [ "fooga" ]
                },
                result = references(null, {
                    messages : [ {
                        plugin  : "postcss-modular-css-scoping",
                        classes : classes
                    } ]
                });
                
            assert.ok(classes !== result);
            
            result.tooga = true;
            
            assert.equal(classes.tooga, undefined);
        });
        
        it("should walk CSS if no message is found", function() {
            var css = postcss.parse(
                    ".fooga { } #wooga { } .googa #tooga { } @keyframes kooga { } @-webkit-keyframes hooga { }"
                );
            
            assert.deepEqual(
                references(css, { messages : [] }),
                {
                    fooga : "fooga",
                    wooga : "wooga",
                    googa : "googa",
                    hooga : "hooga",
                    tooga : "tooga",
                    kooga : "kooga"
                }
            );
        });
    });
});
