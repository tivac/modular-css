import css from "./a.css";
import common from "./common.js";

console.log(css, common);

const d = import("./d.js");

d.then(console.log);

const e = import("./e.js");

e.then(console.log);
