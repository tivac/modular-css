"use strict";

var path = require("path"),
    
    resolve = require("resolve-from"),
    
    relative = require("./relative"),
    
    format = /(.+) from ["']([^'"]+?)["']$/i;

exports.format = format;

exports.match = function(text) {
    return text.search(format) > -1;
};

exports.parse = function(file, text) {
    var parts  = text.match(format),
        keys, source;
    
    if(!parts) {
        return false;
    }
    
    keys   = parts[1].split(",");
    source = parts[2];
    
    return {
        keys : keys.map(function(value) {
            return value.trim();
        }),
        
        source : relative(resolve(path.dirname(file), source))
    };
};
