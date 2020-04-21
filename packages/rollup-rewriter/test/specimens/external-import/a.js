import external from "external";
import css from "./a.css";

export default function() {
    console.log(css, external);

    import("./c.js").then(console.log);
}
