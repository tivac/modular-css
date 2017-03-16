"use strict";

var identifiers = require("../lib/identifiers.js");

describe("/lib", function() {
    describe("/identifiers.js", function() {
        it("should export a parse function", function() {
            expect(typeof identifiers.parse).toBe("function");
        });

        it("should export a keyframes regex", function() {
            expect(identifiers.keyframes).toBeInstanceOf(RegExp);
        });
        
        it("should extract a class", function() {
            expect(identifiers.parse(".fooga")).toEqual([ "fooga" ]);
        });
        
        it("should extract multiple classes", function() {
            expect(identifiers.parse(".fooga, .wooga")).toEqual([ "fooga", "wooga" ]);
            expect(identifiers.parse(".fooga,.wooga")).toEqual([ "fooga", "wooga" ]);
        });
        
        it("should extract an id", function() {
            expect(identifiers.parse("#fooga")).toEqual([ "fooga" ]);
        });
        
        it("should extract multiple ids", function() {
            expect(identifiers.parse("#fooga, #wooga")).toEqual([ "fooga", "wooga" ]);
            expect(identifiers.parse("#fooga,#wooga")).toEqual([ "fooga", "wooga" ]);
        });
        
        it("should extract @keyframes definitions", function() {
            expect(identifiers.parse("@keyframes fooga")).toEqual([ "fooga" ]);
            expect(identifiers.parse("@-webkit-keyframes fooga")).toEqual([ "fooga" ]);
            expect(identifiers.parse("@-moz-keyframes fooga")).toEqual([ "fooga" ]);
        });
        
        it("should extract multi-level classes", function() {
            expect(identifiers.parse(".fooga .wooga")).toEqual([ "fooga", "wooga" ]);
        });
        
        it("should extract multi-level ids", function() {
            expect(identifiers.parse("#fooga #wooga")).toEqual([ "fooga", "wooga" ]);
        });
        
        it("should extract mixed classes, ids, and keyframes", function() {
            // Slightly unintuitive output order is due to the iteration going classes then IDs
            expect(
                // Also this selector is bonkers and makes no sense
                identifiers.parse("#fooga, .wooga, #googa .booga, .tooga #looga, @keyframes kooga")
            ).toEqual(
                [ "wooga", "booga", "tooga", "fooga", "googa", "looga", "kooga" ]
            );
        });
    });
});
