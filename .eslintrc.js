module.exports = {
    extends : [
        "@tivac",
        "plugin:jest/recommended",
        "plugin:eslint-comments/recommended",
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

    reportUnusedDisableDirectives : true,

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

        "no-unused-vars" : [ "warn", {
            varsIgnorePattern : "^_",
            argsIgnorePattern : "^_",
        }],

        // Plugins
        "eslint-comments/require-description" : "warn",
        "eslint-comments/disable-enable-pair" : [ "warn", { allowWholeFile : true }],
    },

    overrides : [{
        files   : [ "packages/www/**/*.svelte" ],

        extends : [
            "plugin:svelte/recommended",
        ],

        // Parse the `<script>` in `.svelte` using babel's parser for import() support
        parserOptions : {
            parser : "@babel/eslint-parser",
        },
        
        rules : {
            // Disabled in favor of svelte/indent further down
            indent : "off",

            // Security

            // Disabled because we use 'em to show markdown content
            "svelte/no-at-html-tags" : "off",

            // Best Practices
            "svelte/no-useless-mustaches"              : "warn",

            // Stylistic Issues
            "svelte/require-optimized-style-attribute" : "error",
            "svelte/first-attribute-linebreak"         : [ "warn", {
                singleline : "beside",
                multiline  : "below",
            }],
            "svelte/html-closing-bracket-spacing" : "warn",
            "svelte/html-quotes"                  : [ "warn", {
                prefer  : "double",
            }],
            "svelte/indent" : [ "warn", {
                indent                    : 4,
                indentScript              : false,
                alignAttributesVertically : true,
            }],
            "svelte/max-attributes-per-line" : [ "warn", {
                singleline : 3,
            }],
            "svelte/mustache-spacing"                          : "warn",
            "svelte/no-spaces-around-equal-signs-in-attribute" : "warn",
            "svelte/prefer-class-directive"                    : "off",
            "svelte/prefer-style-directive"                    : "warn",
            "svelte/shorthand-attribute"                       : "warn",
            "svelte/shorthand-directive"                       : "warn",
            "svelte/spaced-html-comment"                       : "warn",
        },
    }],
};
