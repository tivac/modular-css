"use strict";

/* istanbul ignore next: never run in node that supports Promises natively */
if(!global.Promise) {
    global.Promise = require("promiscuous");
}

module.exports = global.Promise;
