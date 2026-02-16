const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const svelteConfig = require("./packages/www/svelte.config.js");

const babelParser = require("@babel/eslint-parser");
const globals = require("globals");
const js = require("@eslint/js");
const svelte = require("eslint-plugin-svelte");

module.exports = defineConfig([
    js.configs.recommended,
    ...svelte.configs.recommended,
    {
        languageOptions: {
            parser: babelParser,

            parserOptions: {
                requireConfigFile: false,
            },

            globals: {
                ...globals.node,
            },
        },

        linterOptions: {
            reportUnusedDisableDirectives: true,
        },

        rules: {
            "max-statements": ["warn", 25],
            "newline-after-var": "off",
            "newline-before-return": "off",
            "lines-around-directive": "off",

            "padding-line-between-statements": ["warn", {
                blankLine: "always",
                prev: "*",
                next: "return",
            }, {
                blankLine: "always",
                prev: ["const", "let", "var"],
                next: "*",
            }, {
                blankLine: "any",
                prev: ["const", "let", "var"],
                next: ["const", "let", "var"],
            }, {
                blankLine: "always",
                prev: "directive",
                next: "*",
            }, {
                blankLine: "any",
                prev: "directive",
                next: "directive",
            }],

            "no-unused-vars": ["warn", {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
            }],

            "no-console" : "warn",
            "no-empty-function" : "warn",
            "no-await-in-loop" : "warn",
            "complexity" : [ "warn", 25 ],
        },
    },
    {
        

        files: [
            "packages/www/**/*.svelte"
        ],

        languageOptions: {
            globals : {
                ...globals.browser,
            },

            parser: babelParser,

            parserOptions: {
                requireConfigFile : false,
                svelteConfig,
            },
        },

        rules: {
            indent: "off",

            "svelte/no-at-html-tags": "off",
            "svelte/no-useless-mustaches": "warn",
            "svelte/require-optimized-style-attribute": "error",

            "svelte/first-attribute-linebreak": ["warn", {
                singleline: "beside",
                multiline: "below",
            }],

            "svelte/html-closing-bracket-spacing": "warn",

            "svelte/html-quotes": ["warn", {
                prefer: "double",
            }],

            "svelte/indent": ["warn", {
                indent: 4,
                indentScript: false,
                alignAttributesVertically: true,
            }],

            "svelte/max-attributes-per-line": ["warn", {
                singleline: 3,
            }],

            "svelte/mustache-spacing": "warn",
            "svelte/no-spaces-around-equal-signs-in-attribute": "warn",
            "svelte/prefer-class-directive": "off",
            "svelte/prefer-style-directive": "warn",
            "svelte/shorthand-attribute": "warn",
            "svelte/shorthand-directive": "warn",
            "svelte/spaced-html-comment": "warn",
        },
    },
    globalIgnores([
        "**/coverage/",
        "**/dist/",
        "**/node_modules/",
        "**/parsers/",
        "**/specimens/",
        "**/output/",
        "**/.svelte-kit/",
    ])
]);
