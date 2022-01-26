import codemirror from "codemirror";
import "codemirror/mode/css/css.js";

import mcssMime from "$lib/codemirror-mcss-mime.js";

mcssMime(codemirror);

export {
    codemirror,
};
