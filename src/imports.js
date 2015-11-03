"use strict";

var format = /(.+) from ["']([^'"]+?)["']$/i;

exports.format = format;

exports.match = function(text) {
    return text.search(format) > -1;
};

exports.parse = function(text) {
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
        
        source : source
    };
};
