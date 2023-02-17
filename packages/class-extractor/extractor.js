const postcss = require("postcss");

const relative = require("@modular-css/utils/relative.js");
const { parse } = require("@modular-css/utils/identifiers.js");
const { long } = require("@modular-css/namers");

const processor = postcss([{
    postcssPlugin : "extract-classes",
    Rule(rule) {
        const classes = parse(rule.selector);
    },
}]);

const process = (cwd) => (file) => {

};

