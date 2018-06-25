module.exports = {
    extends : [
        "@tivac",
        "plugin:jest/recommended",
    ],
    parserOptions : {
        ecmaVersion : 8,
    },
    env : {
        node : true,
        jest : true,
        es6  : true,
    },

    plugins : [
        "jest",
    ]
};
