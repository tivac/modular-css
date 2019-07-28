::: repl
```css
/* === input.css === */
.input {
    width: 100%;
}

/* === example.css === */
/* Values */
@value warning: rgb(250, 128, 114);

.alert { background: warning; }

/* Scoping */
:global(.alertBanner) {
    /* Composition */
    composes: alert;

    color: rgb(255, 255, 255);
}

/* Styling Overrides */
.fieldset :external(input from "./input.css") {
    width: 50%;
}
```
:::
