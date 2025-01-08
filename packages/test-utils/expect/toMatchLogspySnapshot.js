"use strict";

const path = require("path");

const snapshot = require("jest-snapshot");

const relative = require("../relative.js");

expect.extend({
    toMatchLogspySnapshot(spy) {
        if(!spy || !spy.mock) {
            // eslint-disable-next-line no-console -- booooooom
            console.log({ spy, "spy.mock" : spy.mock });

            return {
                message : () => `Invalid spy passed to .toMatchLogspySnapshot()`,
                pass    : false,
            };
        }

        const calls = spy.mock.calls.map((call) =>
            call.map((arg) => {
                if(typeof arg !== "string") {
                    return arg;
                }
                
                return arg
                    .split(/\r?\n/)
                    .map((line) => (path.isAbsolute(line.trim()) ?
                        relative([ line.trim() ])[0] :
                        line)
                    )
                    .join("\n");
            })
        );

        return snapshot.toMatchSnapshot.call(this, calls);
    },
});
