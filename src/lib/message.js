"use strict";

var find = require("lodash.findlast");

module.exports = function(results, field) {
    var message = find(results.messages, field);
    
    // Don't get to mess w/ other plugins objects
    return Object.assign(Object.create(null), message ? message[field] : {});
};
