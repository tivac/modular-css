import loadcss from "lazyload-css";

import codemirror from "codemirror";
import "codemirror/mode/css/css.js";

import { dependencies } from "../../package.json";

const theme = "base16-light";

Promise.all([
    loadcss(`https://unpkg.com/codemirror@${dependencies.codemirror}/lib/codemirror.css`),
    loadcss(`https://unpkg.com/codemirror@${dependencies.codemirror}/theme/${theme}.css`),
]);

export default codemirror;

export {
    codemirror,
    theme,
};
