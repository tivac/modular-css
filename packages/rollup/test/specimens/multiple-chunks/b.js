import css from "./b.css";
import common from "./common.js";

console.log(css, common);

const c = import("./c.js");

c.then(console.log);
