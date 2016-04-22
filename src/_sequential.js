"use strict";

var Promise = require("./_promise");

module.exports = function(promises) {
    return new Promise(function(resolve, reject) {
        promises.reduce(function(curr, next) {
            return curr.then(next);
        }, Promise.resolve()).then(resolve, reject);
    });
};
