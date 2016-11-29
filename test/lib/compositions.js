"use strict";

module.exports = (result) => {
    var msg = result.messages.find((msg) => (msg.name === "modular-css-compositions"));

    return msg ? msg.compositions : false;
};
