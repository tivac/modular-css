module.exports = {
    extends : [
        "@tivac",
        "plugin:jest/recommended",
    ],

    parser : "@babel/eslint-parser",

    parserOptions : {
        requireConfigFile : false,
    },

    env : {
        node : true,
        jest : true,
        es6  : true,
    },

    plugins : [
        "jest",
    ],

    rules : {
        "max-statements"         : [ "warn", 25 ],
        "newline-after-var"      : "off",
        "newline-before-return"  : "off",
        "lines-around-directive" : "off",
        
        "padding-line-between-statements" : [
            "warn",
            // Always want a newline before "return"
            { blankLine : "always", prev : "*", next : "return" },
            // Newline after variable declarations
            { blankLine : "always", prev : [ "const", "let", "var" ], next : "*" },
            { blankLine : "any",    prev : [ "const", "let", "var" ], next : [ "const", "let", "var" ] },
            // Newline after directives
            { blankLine : "always", prev : "directive", next : "*" },
            { blankLine : "any", prev : "directive", next : "directive" },
        ],
    },
};
