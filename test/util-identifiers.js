"use strict";

var assert = require("assert"),

    identifiers = require("../src/_identifiers");

describe("postcss-modular-css", function() {
    describe("util-identifiers", function() {
        it("should export a parse function", function() {
            assert.equal(typeof identifiers.parse, "function");
        });

        it("should export a keyframes regex", function() {
            assert(identifiers.keyframes instanceof RegExp);
        });
        
        it("should extract a class", function() {
            assert.deepEqual(identifiers.parse(".fooga"), [ "fooga" ]);
        });
        
        it("should extract multiple classes", function() {
            assert.deepEqual(identifiers.parse(".fooga, .wooga"), [ "fooga", "wooga" ]);
            assert.deepEqual(identifiers.parse(".fooga,.wooga"), [ "fooga", "wooga" ]);
        });
        
        it("should extract an id", function() {
            assert.deepEqual(identifiers.parse("#fooga"), [ "fooga" ]);
        });
        
        it("should extract multiple ids", function() {
            assert.deepEqual(identifiers.parse("#fooga, #wooga"), [ "fooga", "wooga" ]);
            assert.deepEqual(identifiers.parse("#fooga,#wooga"), [ "fooga", "wooga" ]);
        });
        
        it("should extract @keyframes definitions", function() {
            assert.deepEqual(identifiers.parse("@keyframes fooga"), [ "fooga" ]);
            assert.deepEqual(identifiers.parse("@-webkit-keyframes fooga"), [ "fooga" ]);
            assert.deepEqual(identifiers.parse("@-moz-keyframes fooga"), [ "fooga" ]);
        });
        
        it("should extract multi-level classes", function() {
            assert.deepEqual(identifiers.parse(".fooga .wooga"), [ "fooga", "wooga" ]);
        });
        
        it("should extract multi-level ids", function() {
            assert.deepEqual(identifiers.parse("#fooga #wooga"), [ "fooga", "wooga" ]);
        });
        
        it("should extract mixed classes, ids, and keyframes", function() {
            // Slightly unintuitive output order is due to the iteration going classes then IDs
            assert.deepEqual(
                
                // Also this selector is bonkers and makes no sense
                identifiers.parse("#fooga, .wooga, #googa .booga, .tooga #looga, @keyframes kooga"),
                [ "wooga", "booga", "tooga", "fooga", "googa", "looga", "kooga" ]
            );
        });
    });
});
