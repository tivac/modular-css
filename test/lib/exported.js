"use strict";

module.exports = (result) =>
    result.messages.find((msg) => (msg.name === "modular-css")) || false;
