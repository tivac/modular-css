import css from "./entry2.css";

console.log(css);

(function() {
    import("./dynamic1.js").then(console.log);
}());
