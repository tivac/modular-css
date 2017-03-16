"use strict";

var namer = require("../");

describe("modular-css-namer", function() {
    var fn;
    
    beforeEach(() => (fn = namer()));
    
    it("should hash its arguments", function() {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
    });
    
    it("should differ within files", function() {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
        expect(fn("./fooga", ".booga")).toMatchSnapshot();
    });
    
    it("should re-use selectors for identical inputs", function() {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
    });

    it("should differ between files", function() {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
        expect(fn("./booga", ".fooga")).toMatchSnapshot();
    });
    
    it("should wrap as necessary", function() {
        var x, y;
        
        for(x = 0; x < 100; x++) {
            for(y = 0; y < 100; y++) {
                fn(`./fooga${x}`, `.fooga${y}`);
            }
        }
        
        expect(fn(`./fooga${15}`, `.fooga${5}`)).toMatchSnapshot();
        expect(fn(`./fooga${1}`, `.fooga${5}`)).toMatchSnapshot();
        expect(fn(`./fooga${49}`, `.fooga${33}`)).toMatchSnapshot();
        expect(fn(`./fooga${55}`, `.fooga${63}`)).toMatchSnapshot();
        expect(fn(`./fooga${26}`, `.fooga${0}`)).toMatchSnapshot();
    });
});
