"use strict";

const namer = require("../namer");

describe("modular-css-namer", () => {
    let fn;
    
    beforeEach(() => (fn = namer()));
    
    it("should hash its arguments", () => {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
    });
    
    it("should differ within files", () => {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
        expect(fn("./fooga", ".booga")).toMatchSnapshot();
    });
    
    it("should re-use selectors for identical inputs", () => {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
    });

    it("should differ between files", () => {
        expect(fn("./fooga", ".fooga")).toMatchSnapshot();
        expect(fn("./booga", ".fooga")).toMatchSnapshot();
    });
    
    it("should wrap as necessary", () => {
        for(let x = 0; x < 100; x++) {
            for(let y = 0; y < 100; y++) {
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
