## Introduction

### Overview

`modular-css` implements the best features of the CSS Modules spec and then adds on several extra features to make for a smoother developer experience. It has support for almost all the different ways you might want to work, easy extensibility, and allows for using the entire ecosystem of postcss plugins to customize your CSS however you see fit.

### Why

CSS Modules has been abandoned for anyone who doesn't use webpack, and the webpack version doesn't support the features we need. Attempts to improve that situation have been unsuccessful for a variety of reasons. Thus, a perfect storm of compelling reasons to learn [PostCSS](http://postcss.org/) was found.

Also because this:

<p align="center">
    <a href="https://twitter.com/iamdevloper/status/636455478093029376">
        <img src="https://i.imgur.com/fcq3GsW.png" alt="Green pills look gross" />
    </a>
</p>

### How

There are a lot of different ways to use `modular-css`, pick your favorite!

- [Rollup](#rollup) - Tiny bundles, code-splitting, and first-class `modular-css` support. 👌🏻
- [Webpack](#webpack) - Not as full-featured or well-supported as the rollup plugin but works pretty ok.
- [Browserify](#browserify) - The old standby. Supports `factor-bundle` for painless CSS bundle splitting!
- [Svelte](#svelte) - Take your svelte components and power them up using `modular-css`! ⚡
- [JS API](#js-api) - The core of `modular-css`, reasonably usable and powers literally everything else.
- [CLI](#cli) - `modular-css` via CLI, for those times where you need to try something really quickly.
- [PostCSS Plugin](#postcss-plugin) - Postcss-within-postcss, because sometimes you just need to do a thing. 😵
- [Globbing API](#globbing-api)- Grab `**/*.css` and get a move on. The globbing API is here for you!
