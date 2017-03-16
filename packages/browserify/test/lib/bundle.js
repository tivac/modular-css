"use strict";

module.exports = (build) =>
    new Promise((resolve, reject) => {
        build.bundle(function(err, out) {
            expect(err).toBeFalsy();

            // CSS processing in the plugin takes non-zero amount of time,
            // this is ridiculous but seemingly unavoiadable
            setTimeout(() => {
                resolve(out.toString())
            }, 25);
        });
    });
