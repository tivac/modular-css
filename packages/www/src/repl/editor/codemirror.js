import codemirror from "codemirror";
import "codemirror/mode/css/css.js";

import mcssMime from "../../../build/codemirror-mcss-mime.cjs/index.js";

mcssMime(codemirror);

export {
    codemirror,
};
