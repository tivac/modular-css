module.exports = () => {
    const md = require("markdown-it")({
        html        : true,
        linkify     : true,
        typographer : true,
    });

    md.use(require("markdown-it-prism"));

    return md;
};
