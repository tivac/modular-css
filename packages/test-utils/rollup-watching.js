"use strict";

const defer = require("p-defer");

module.exports = (cb) => {
    let count = 0;

    return (details) => {
        if(details.code === "ERROR" || details.code === "FATAL") {
            throw details.error;
        }

        if(details.code !== "END") {
            return;
        }

        count++;

        cb(count, details);
    };
};

module.exports.promise = (watcher) => {
    let deferred;

    watcher.on("event", (e) => {
        console.log("watch event", e.code);
        
        if(e.code === "ERROR" || e.code === "FATAL") {
            return deferred && deferred.reject(e.error);
        }
        
        if(e.code !== "END") {
            // eslint-disable-next-line consistent-return
            return;
        }

        return deferred && deferred.resolve(e);
    });

    const out = () => {
        deferred = defer();

        return deferred.promise;
    };

    out.close = () => watcher.close();
    
    return out;
};
