import loadcss from "lazyload-css";

import CodeMirror from "codemirror";
import "codemirror/mode/css/css.js";

Promise.all([
    loadcss("https://unpkg.com/codemirror@5.42.2/lib/codemirror.css"),
    loadcss("https://unpkg.com/codemirror@5.42.2/theme/mdn-like.css"),
]);

// Why .default? Who knows
export default CodeMirror;
