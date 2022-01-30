"use strict";

module.exports = ({ messages }, filter) => {
    let message;
    
    for(let i = 0; i < messages.length; i++) {
        if(filter(messages[i])) {
            message = messages[i]
        }
    }

    // Don't get to mess w/ other plugins objects
    return {
        __proto__ : null,

        ...(message ? message[filter] : {}),
    };
};
