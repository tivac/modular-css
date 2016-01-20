"use strict";

var assert = require("assert");

module.exports = function bundle(build, done) {
    build.bundle(function(err, out) {
        assert.ifError(err);

        // Wrapped because browserify event lifecycle demands it
        // Need to investigate further
        setTimeout(function() {
            done(out.toString());
        }, 25);
    });
};
