"use strict";

var assign = require("lodash.assign"),
    find   = require("lodash.findlast");

module.exports = function(results, field) {
    var message = find(results.messages, field);
    
    // Don't get to mess w/ other plugins objects
    return assign({}, message ? message[field] : {});
};
