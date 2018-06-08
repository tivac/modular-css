import css from "./b.css";

export default function() {
    console.log(css);
    
    import("./c.js").then(console.log);
}
