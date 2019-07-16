```css
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

[Live REPL Example](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUABAbtADYCuApgAQDu0ATvAgOYBc5NDARgBQBMArAAyZyARm4AOIcOEAWAJQBuADrxliIqRoAXcgG9y7aMgDWDGgHti8ACYtqdRvPIBfZcvAAqcgGVkZgA6M5O7gykwMhGYGhJxqhBqaAELQ8PAasrrK5FnkHuQAwmaQfmaosJqwZvBBIVXZvkUlpKgs6lpKKrVZvhE0LGxcfLxCg8O8vArKLh25XpoAnoSBAPJ4GjSwVk3VqgBmsKSEVqik2kykAB6aGvBEnAh+xNo75pDkiqCI4HtxAMwo6O90jpMtlKBtNAALFgCACk7ScoAAupgwF9YL9-hhsIh7o8Mp0qOCoSJ+Pw4ZMkYigA)!
