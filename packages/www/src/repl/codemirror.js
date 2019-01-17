import loadcss from "lazyload-css";

import codemirror from "codemirror";
import "codemirror/mode/css/css.js";

const theme = "base16-light";

Promise.all([
    loadcss(`https://unpkg.com/codemirror@${codemirror.version}/lib/codemirror.css`),
    loadcss(`https://unpkg.com/codemirror@${codemirror.version}/theme/${theme}.css`),
]);

export default codemirror;

export {
    codemirror,
    theme,
};
