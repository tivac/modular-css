---
"@modular-css/processor": major
---

Errors will be reported for more invalid uses of `composes:`

```css
.fooga { color: red; }

/* ✅ still valid  */
.wooga { composes: fooga; }

/* 🚫, previously reported */
.wooga .tooga { composes: fooga; }

/* 🚫, previously reported */
.wooga.tooga { composes: fooga; }

/* 🆕🚫, previously silently ignored */
html { composes: fooga; }

/* 🆕🚫, previously acted like .class */
.class:focus { composes: fooga; }

/* 🆕🚫, previously acted like .class */
.class::after { composes: fooga; }

/* 🆕🚫, previously acted like .class */
@media (min-width: 800px) {
    .class { composes: fooga; }
}
```

The most likely breaking change will be the removal of pseudo selectors as valid. Previously classes with a pseudo were treated as though the pseudo didn't exist. If you have class selectors that contain a pseudo that need to use `composes` the suggested workaround is something like this:

```css
.fooga { color: red; }

/* BEFORE */
.wooga,
.wooga:active {
    composes: fooga;

    background: blue;
}

/* AFTER */
.wooga { composes: fooga; }

.wooga,
.wooga:active {
    background: blue;
}
```