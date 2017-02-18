modular-css [![NPM Version](https://img.shields.io/npm/v/modular-css.svg)](https://www.npmjs.com/package/modular-css) [![Build Status](https://img.shields.io/travis/tivac/modular-css/master.svg)](https://travis-ci.org/tivac/modular-css)
===========

A streamlined re-interpretation of [CSS Modules](https://github.com/css-modules/css-modules)

## Install

### [API](/packages/modular-css-core/README.md)

```bash
$ npm i modular-css-core
```

### [CLI](/packages/modular-css-cli/README.md)

```bash
$ npm i modular-css-cli
```

### [Browserify](/packages/modular-cssify/README.md)

```bash
$ npm i modular-cssify
```

### [Rollup](/packages/modular-css-rollup/README.md)

```bash
$ npm i modular-css-rollup
```

### [Webpack 2](/packages/modular-css-webpack/README.md)

```bash
$ npm i modular-css-webpack
```

### [PostCSS Plugin](/packages/postcss-modular-css/README.md)

```bash
$ npm i postcss-modular-css
```

### [Globbing API](/packages/modular-css-glob/README.md)

```bash
$ npm i modular-css-glob
```

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
