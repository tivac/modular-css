"use strict";

var find = require("lodash.findlast");

module.exports = (results, filter, field) => {
    var message = find(results.messages, filter);

    if(!field) {
        field = filter;
    }
    
    // Don't get to mess w/ other plugins objects
    return Object.assign(
        Object.create(null),
        message ? message[field] : {}
    );
};
