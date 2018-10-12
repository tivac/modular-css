"use strict";

const path = require("path");

const relative = require("./relative.js");

module.exports = (method = "log") => {
    const spy = jest.spyOn(global.console, method);

    spy.mockImplementation(() => { /* NO-OP */ });

    return {
        spy,

        logSnapshot() {
            expect(spy).toHaveBeenCalled();

            const calls = spy.mock.calls.map((call) =>
                call.map((arg) => (path.isAbsolute(arg) ?
                    relative([ arg ])[0] :
                    arg
                ))
            );

            expect(calls).toMatchSnapshot();
        },
    };
};
