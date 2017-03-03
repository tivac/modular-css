"use strict";

module.exports = function bundle(build, done) {
    build.bundle(function(err, out) {
        expect(err).toBeFalsy();

        // Wrapped because browserify event lifecycle demands it
        // Need to investigate further
        setTimeout(function() {
            done(out.toString());
        }, 25);
    });
};
