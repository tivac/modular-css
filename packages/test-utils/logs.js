const path = require("path");
const { spyOn } = require("nanospy");

const relative = require("./relative.js");

const logSpy = (method = "log") => spyOn(global.console, method, () => { /* NO-OP */ });

const logSpyCalls = (spy) => {
    if(!spy || !spy.calls) {
        throw new Error(`Invalid spy passed to logSpyCalls()`);
    }

    return spy.calls.map((call) =>
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
};

module.exports = {
    logSpy,
    logSpyCalls,
};
