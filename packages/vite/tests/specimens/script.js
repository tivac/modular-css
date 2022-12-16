import a from "./a.mcss";
import b from "./b.mcss";

console.log({ a, b });

const aEl = document.querySelector("#a");
const bEl = document.querySelector("#b");

aEl.className = a.a;
bEl.className = b.b;
