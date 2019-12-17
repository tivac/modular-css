"use strict";

const find = require("lodash/findLast");

module.exports = ({ messages }, filter) => {
    const message = find(messages, filter);

    // Don't get to mess w/ other plugins objects
    return {
        __proto__ : null,

        ...(message ? message[filter] : {}),
    };
};
