modular-css  [![NPM Version](https://img.shields.io/npm/v/modular-css.svg)](https://www.npmjs.com/package/modular-css) [![NPM License](https://img.shields.io/npm/l/modular-css.svg)](https://www.npmjs.com/package/modular-css) [![NPM Downloads](https://img.shields.io/npm/dm/modular-css.svg)](https://www.npmjs.com/package/modular-css)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

A streamlined re-interpretation of [CSS Modules](https://github.com/css-modules/css-modules). This package is a bundle that includes all of the functionality, you may want something more specific.

## Install

```bash
$ npm i modular-css
```

## Specific Packages

### [JS API](https://npmjs.com/modular-css-core)

```bash
$ npm i modular-css-core
```

### [CLI](https://npmjs.com/modular-css-cli)

```bash
$ npm i modular-css-cli
```

### [Browserify](https://npmjs.com/modular-cssify)

```bash
$ npm i modular-cssify
```

### [Rollup](https://npmjs.com/modular-css-rollup)

```bash
$ npm i modular-css-rollup
```

### [Webpack 2](https://npmjs.com/modular-css-webpack)

```bash
$ npm i modular-css-webpack
```

### [PostCSS Plugin](https://npmjs.com/postcss-modular-css)

```bash
$ npm i postcss-modular-css
```

### [Globbing API](https://npmjs.com/modular-css-glob)

```bash
$ npm i modular-css-glob
```

## Usage

- [API](docs/api.md)
- [CLI](docs/cli.md)
- [Browserify](docs/browserify.md) Plugin
- [Rollup](docs/rollup.md) Plugin
- [PostCSS](docs/postcss.md) Plugin
- [Webpack 2](docs/webpack.md) Plugin

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
