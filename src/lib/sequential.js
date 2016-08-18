"use strict";

module.exports = function(fns) {
    return new Promise(function(resolve, reject) {
        fns.reduce(function(curr, next) {
            return curr.then(next, reject);
        }, Promise.resolve()).then(resolve, reject);
    });
};
