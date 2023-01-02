# modular-css Overview

## Introduction

### What

modular-css implements the best features of the CSS Modules spec and then adds on several extra features to make for a smoother developer experience. It also supports many of the most-popular build tooling proects, is designed for extensibility, and allows for using the entire ecosystem of postcss plugins to customize your CSS.

### Why

CSS Modules has been abandoned as a standard and the current implementation is full of bugs. Attempts to improve that situation have been unsuccessful for years. I also wanted a reason to dive deep with [PostCSS](http://postcss.org/), so here we are.

Also because this 👇👇👇

<p align="center">
    <a href="https://twitter.com/iamdevloper/status/636455478093029376">
        <img src="/pills-lol.jpg" alt="Green pills look gross" />
    </a>
</p>

### How

There are a lot of different ways to use `modular-css`, pick your favorite!

- [Rollup](/api/#bundlers-rollup) - Tiny bundles, code-splitting, and first-class `modular-css` support. 👌🏻
- [Vite](/api/#bundlers-vite) - Also tiny bundles, code-splitting, and first-class `modular-css` support, but now with a server! 🎉
- [Webpack](/api/#bundlers-webpack) - Not as full-featured or well-supported as the rollup plugin but works pretty ok.
- [Browserify](/api/#bundlers-browserify) - The old standby. Supports `factor-bundle` for painless CSS bundle splitting!
- [Svelte](/api/#other-tools-svelte-preprocessor) - Take your svelte components and power them up using `modular-css`! ⚡
- [JS API](/api/#direct-usage-js-api) - The core of `modular-css`, reasonably usable and powers literally everything else.
- [CLI](/api/#direct-usage-cli) - `modular-css` via CLI, for those times where you need to try something really quickly.
- [PostCSS Plugin](/api/#other-tools-postcss) - Postcss-within-postcss, because sometimes you just need to do a thing. 😵
- [Globbing API](/api/#direct-usage-globbing-api)- Grab `**/*.css` and get a move on. The globbing API is here for you!

@import "./features.md"