import css from "./style.css";

console.log(css);

document.querySelector("[data-type='foo']").setAttribute("class", css.foo);
document.querySelector("[data-type='bar']").setAttribute("class", css.bar);