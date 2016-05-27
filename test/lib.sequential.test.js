"use strict";

var assert = require("assert"),
    
    Promise    = require("../src/lib/promise"),
    sequential = require("../src/lib/sequential");

describe("/lib", function() {
    describe("/sequential.js", function() {
        it("should run a series of promises in order", function() {
            var out = [];
            
            return sequential([
                function() {
                    return (new Promise(function(resolve) {
                        out.push(1);
                        return resolve();
                    }));
                },
                function() {
                    return (new Promise(function(resolve) {
                        out.push(2);
                        return resolve();
                    }));
                },
                function() {
                    return (new Promise(function(resolve) {
                        out.push(3);
                        return resolve();
                    }));
                }
            ])
            .then(function() {
                assert.deepEqual(out, [ 1, 2, 3 ]);
            });
        });
        
        it("should stop execution if a promise rejects", function() {
            return sequential([
                function() {
                    return (new Promise(function(resolve) {
                        resolve();
                    }));
                },
                function() {
                    return (new Promise(function(resolve, reject) {
                        reject("rejected");
                    }));
                },
                function() {
                    return (new Promise(function() {
                        assert.fail();
                    }));
                }
            ])
            .then(
                function() {
                    assert.fail();
                },
                function(error) {
                    assert.equal("rejected", error);
                }
            );
        });
    });
});
