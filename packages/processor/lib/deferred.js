"use strict";

const deferred = () => {
    let resolve;
    let reject;
    
    const promise = new Promise((ok, no) => {
        resolve = ok;
        reject = no;
    });
    
    promise.resolve = resolve;
    promise.reject = reject;

    return promise;
};

module.exports = deferred;
