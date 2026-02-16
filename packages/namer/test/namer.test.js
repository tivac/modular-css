const { describe, it, beforeEach } = require("node:test");

const namer = require("../namer");

describe("@modular-css/shortnames", () => {
    let fn;
    
    beforeEach(() => (fn = namer()));
    
    it("should hash its arguments", (t) => {
        t.assert.snapshot(fn("./fooga", ".fooga"));
    });
    
    it("should differ within files", (t) => {
        t.assert.snapshot(fn("./fooga", ".fooga"));
        t.assert.snapshot(fn("./fooga", ".booga"));
    });
    
    it("should re-use selectors for identical inputs", (t) => {
        t.assert.snapshot(fn("./fooga", ".fooga"));
        t.assert.snapshot(fn("./fooga", ".fooga"));
    });

    it("should differ between files", (t) => {
        t.assert.snapshot(fn("./fooga", ".fooga"));
        t.assert.snapshot(fn("./booga", ".fooga"));
    });
    
    it("should wrap as necessary", (t) => {
        for(let x = 0; x < 100; x++) {
            for(let y = 0; y < 100; y++) {
                fn(`./fooga${x}`, `.fooga${y}`);
            }
        }
        
        t.assert.snapshot(fn(`./fooga${15}`, `.fooga${5}`));
        t.assert.snapshot(fn(`./fooga${1}`, `.fooga${5}`));
        t.assert.snapshot(fn(`./fooga${49}`, `.fooga${33}`));
        t.assert.snapshot(fn(`./fooga${55}`, `.fooga${63}`));
        t.assert.snapshot(fn(`./fooga${26}`, `.fooga${0}`));
    });
});
