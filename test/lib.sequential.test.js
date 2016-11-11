"use strict";

var assert = require("assert"),
    
    sequential = require("../src/lib/sequential");

describe("/lib", function() {
    describe("/sequential.js", function() {
        it("should run a series of promises in order", function() {
            var out = [];
            
            return sequential([
                () => (new Promise((resolve) => {
                    out.push(1);
                    
                    return resolve();
                })),
                () => (new Promise((resolve) => {
                    out.push(2);
                    
                    return resolve();
                })),
                () => (new Promise((resolve) => {
                    out.push(3);

                    return resolve();
                }))
            ])
            .then(() => assert.deepEqual(out, [ 1, 2, 3 ]));
        });
        
        it("should stop execution if a promise rejects", function() {
            return sequential([
                () => (new Promise((resolve) => resolve())),
                () => (new Promise((resolve, reject) => reject("rejected"))),
                () => (new Promise(() => assert.fail()))
            ])
            .then(
                () => assert.fail(),
                (error) => assert.equal("rejected", error)
            );
        });
    });
});
