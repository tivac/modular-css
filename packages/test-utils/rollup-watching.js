"use strict";

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
