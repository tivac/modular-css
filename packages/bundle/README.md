modular-css [![NPM Version](https://img.shields.io/npm/v/modular-css.svg)](https://www.npmjs.com/package/modular-css) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
===========
<p align="center">
    <a href="https://www.npmjs.com/package/modular-css" alt="NPM License"><img src="https://img.shields.io/npm/l/modular-css.svg" /></a>
    <a href="https://www.npmjs.com/package/modular-css" alt="NPM Downloads"><img src="https://img.shields.io/npm/dm/modular-css.svg" /></a>
    <a href="https://david-dm.org/tivac/modular-css" alt="Dependency Status"><img src="https://img.shields.io/david/tivac/modular-css.svg" /></a>
    <a href="https://david-dm.org/tivac/modular-css#info=devDependencies" alt="devDependency Status"><img src="https://img.shields.io/david/dev/tivac/modular-css.svg" /></a>
</p>

A streamlined re-interpretation of [CSS Modules](https://github.com/css-modules/css-modules)

## Install

`$ npm i modular-css`

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
