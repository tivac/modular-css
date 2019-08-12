"use strict";

module.exports = {
    rules : {
        "at-rule-no-unknown" : [ true, {
            ignoreAtRules : [
                "value",
                "composes",
            ],
        }],

        "declaration-block-no-duplicate-properties" : [ true, {
            ignoreProperties : [
                "composes",
            ],
        }],

        "property-no-unknown" : [ true, {
            ignoreProperties : [
                "composes",
            ],
        }],

        "selector-pseudo-class-no-unknown" : [ true, {
            ignorePseudoClasses : [
                "global",
                "external",
            ],
        }],
    },
};
