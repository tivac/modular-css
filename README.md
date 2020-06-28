modular-css [![Build Status](https://img.shields.io/travis/tivac/modular-css/main.svg)](https://travis-ci.org/tivac/modular-css) [![Gitter](https://img.shields.io/gitter/room/modular-css/modular-css.svg)](https://gitter.im/modular-css/modular-css)
===========

A streamlined re-interpretation of [CSS Modules](https://github.com/css-modules/css-modules)

## Try it

There's an online REPL where you can try out `modular-css` without needing to install anything!

http://m-css.com/repl

## Features

### Composition
```css
.red {
    color: red;
}

.blue {
    composes: red;

    background: blue;
}

/* in the output .blue will be combination of both styles */
```

### Values
```css
@value alert: #F00;

.alert {
    color: alert;
}

/* will output as */

.alert {
    color: #F00;
}
```

### Selector Scoping

```css
.style {
    color: red;
}

:global(.style2) {
    color: blue;
}

/* Will output as */

/* Scoped with unique file-based prefix */
.f5507abd_style {
    color: red;
}

/* Remains unstyled due to :global() pseudo */
.style2 {
    color: blue;
}
```

### Style Overrides
```css
/* input.css */
.input {
    width: 100%;
}

/* fieldset.css */
.fieldset :external(input from "./input.css") {
    width: 50%;
}
```

More detailed descriptions are available on [the website](https://m-css.com/guide/#features).

## Install

https://m-css.com/guide/#usage
