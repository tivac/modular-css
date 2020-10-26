"use strict";

module.exports = (method = "log") => {
    const spy = jest.spyOn(global.console, method);

    spy.mockImplementation(() => { /* NO-OP */ });

    return spy;
};
