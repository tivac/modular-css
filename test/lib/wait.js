"use strict";
    
var fs = require("fs"),
    
    Promise = require("../../src/lib/promise");
    
module.exports = function(file) {
    return new Promise(function(resolve) {
        var interval;
        
        // Just poll because watchers are dumb
        interval = setInterval(function() {
            if(fs.existsSync(file)) {
                clearInterval(interval);
                
                return resolve(file);
            }
            
            return false;
        }, 50);
    });
};
