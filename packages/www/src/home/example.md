```css
/* Values */
@value alert: rgb(250, 128, 114);

.alert { background: alert; }

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
