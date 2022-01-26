"use strict";

// Load up the various codemirror modes
import "codemirror/mode/css/css.js";

export default (codemirror) => {
    // Get a reference to the original CSS mode
    const mode = codemirror.resolveMode("text/css");

    // Create a custom mime type mode for modular-css!
    codemirror.defineMIME("text/modular-css", {
        ...mode,

        propertyKeywords : {
            ...mode.propertyKeywords,
            composes : true,
        },

        tokenHooks : {
            ...mode.tokenHooks,

            ["@"](stream) {
                if(!stream.match(/value|composes/)) {
                    return false;
                }

                stream.eat(" ");

                stream.peek();

                if(stream.match("\"")) {
                    return [ "def" ];
                }

                if(stream.match(/\w+/)) {
                    return [ "def" ];
                }

                return false;
            },

            [":"](stream) {
                if(!stream.match("external(", false)) {
                    return false;
                }

                stream.match("external");

                return [ "def" ];
            },
        },

        helperType  : "mcss",
        allowNested : true,
    });
};
