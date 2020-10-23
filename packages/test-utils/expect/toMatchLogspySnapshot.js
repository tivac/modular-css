"use strict";

const path = require("path");

const snapshot = require("jest-snapshot");

const relative = require("../relative.js");

expect.extend({
    toMatchLogspySnapshot(spy) {
        if(!spy || !spy.mock) {
            return {
                message : () => `Invalid spy passed to .toMatchLogspySnapshot()`,
                pass    : false,
            };
        }

        const calls = spy.mock.calls.map((call) =>
            call.map((arg) => (path.isAbsolute(arg) ?
                relative([ arg ])[0] :
                arg
            ))
        );

        return snapshot.toMatchSnapshot.call(this, calls);
    },
});
