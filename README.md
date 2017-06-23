modular-css [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css) [![Gitter](https://img.shields.io/gitter/room/modular-css/modular-css.svg)](https://gitter.im/modular-css/modular-css)
===========

A streamlined re-interpretation of [CSS Modules](https://github.com/css-modules/css-modules)

## Try it

There's an online REPL where you can try out `modular-css` without needing to install anything!

http://m-css.com

Here's a prefilled version showing some [`modular-css` features](http://m-css.com/#W3sibmFtZSI6Ii8xLmNzcyIsImNzcyI6Ii8qIHNpbXBsZSB2YWx1ZXMgKi9cblxuQHZhbHVlIHJlZDogI0YwMDtcbkB2YWx1ZSBibHVlOiAjMDBGO1xuXG4uYSB7IGNvbG9yOiByZWQ7IH1cblxuLyogc2VsZWN0b3Igbm90IHJlbmFtZWQgKi9cbjpnbG9iYWwoLmIpIHsgYmFja2dyb3VuZDogd2hpdGU7IH1cblxuLyogTm90IG91dHB1dCBpbiBDU1MgYmVjYXVzZSBvbmx5IGNvbXBvc2VzICovXG4uYyB7IGNvbXBvc2VzOiBhOyB9XG4ifSx7Im5hbWUiOiIvMi5jc3MiLCJjc3MiOiJAdmFsdWUgKiBhcyBvbmUgZnJvbSBcIi4vMS5jc3NcIjtcblxuLyogaW1wb3J0IHZhbHVlcyBhcyBhIG5hbWVzcGFjZSAqL1xuLmEgeyBjb2xvcjogb25lLnJlZDsgfVxuXG4vKiBncmFiIHJlZmVyZW5jZSB0byBleHRlcm5hbCBzZWxlY3RvciBmb3Igb3ZlcnJpZGVzICovXG4uYiA6ZXh0ZXJuYWwoYSBmcm9tIFwiLi8xLmNzc1wiKSB7IGNvbG9yOiBvbmUuYmx1ZTsgfSJ9XQ==).

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

More detailed descriptions are available in [docs/features.md](docs/features.md)

## Install

### [JS API](/packages/core/#readme)

```bash
$ npm i modular-css-core
```

### [CLI](/packages/cli/#readme)

```bash
$ npm i modular-css-cli
```

### [Browserify](/packages/browserify/#readme)

```bash
$ npm i modular-cssify
```

### [Rollup](/packages/rollup/#readme)

```bash
$ npm i modular-css-rollup
```

### [Webpack 2](/packages/webpack/#readme)

```bash
$ npm i modular-css-webpack
```

### [PostCSS Plugin](/packages/postcss/#readme)

```bash
$ npm i postcss-modular-css
```

### [Globbing API](/packages/glob/#readme)

```bash
$ npm i modular-css-glob
```

## Why?

CSS Modules doesn't support the features we need & has bugs blocking our usage.
Attempts to fix those bugs have been unsuccessful for a variety of reasons.
Thus, a perfect storm of compelling reasons to learn [PostCSS](http://postcss.org/) was found.

Also because this:

<p align="center">
    <a href="https://twitter.com/iamdevloper/status/636455478093029376">
        <img src="https://i.imgur.com/fcq3GsW.png" alt="Green pills look gross" />
    </a>
</p>

## Thanks

- [@JoshGalvin](https://github.com/JoshGalvin) for ideas/encouragement to do this silly thing.
- The CSS modules team for inspiration!
