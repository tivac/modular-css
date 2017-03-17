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
            expect(identifiers.parse(".fooga")).toMatchSnapshot();
        });
        
        it("should extract multiple classes", function() {
            expect(identifiers.parse(".fooga, .wooga")).toMatchSnapshot();
            expect(identifiers.parse(".fooga,.wooga")).toMatchSnapshot();
        });
        
        it("should extract an id", function() {
            expect(identifiers.parse("#fooga")).toMatchSnapshot();
        });
        
        it("should extract multiple ids", function() {
            expect(identifiers.parse("#fooga, #wooga")).toMatchSnapshot();
            expect(identifiers.parse("#fooga,#wooga")).toMatchSnapshot();
        });
        
        it("should extract @keyframes definitions", function() {
            expect(identifiers.parse("@keyframes fooga")).toMatchSnapshot();
            expect(identifiers.parse("@-webkit-keyframes fooga")).toMatchSnapshot();
            expect(identifiers.parse("@-moz-keyframes fooga")).toMatchSnapshot();
        });
        
        it("should extract multi-level classes", function() {
            expect(identifiers.parse(".fooga .wooga")).toMatchSnapshot();
        });
        
        it("should extract multi-level ids", function() {
            expect(identifiers.parse("#fooga #wooga")).toMatchSnapshot();
        });
        
        it("should extract mixed classes, ids, and keyframes", function() {
            // Slightly unintuitive output order is due to the iteration going classes then IDs
            // Also this selector is bonkers and makes no sense
            expect(
                identifiers.parse("#fooga, .wooga, #googa .booga, .tooga #looga, @keyframes kooga")
            )
            .toMatchSnapshot();
        });
    });
});
