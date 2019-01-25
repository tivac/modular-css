import css from "./b.css";

export default function() {
    console.log(css);

    import("./d.js").then(console.log);
}
