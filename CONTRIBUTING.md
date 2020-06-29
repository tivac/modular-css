# Contributing to `modular-css`

## Welcome!

Hi! Thanks for stopping by. Hopefully this document helps you get your bearings in contributing to `modular-css`. If it doesn't don't hesitate to ask questions, either in [gitter](https://gitter.im/modular-css/modular-css/), on [twitter](https://twitter.com/tivac), or via [email](mailto:github@patcavit.com). I'm always happy to see new folk interested in contributing!

## Getting Started

1. Fork the project
2. Clone your fork
3. `npm i` to install all the dependencies
4. `npm test` to verify that things are working for you locally
5. Make your changes
6. `npm test <package>` will run just the tests for the package you're changing. This can help with iteration speed!

[Travis CI](https://travis-ci.org/tivac/modular-css) will run against any PRs you post, so it's a good idea to get your local tests passing first.

## Project structure

`modular-css` is a [lernajs](https://lernajs.io/) monorepo, so there's a bit of configuration in the root but the meat of the project lives within the `packages/` folders. Here's a quick-n-dirty breakdown of some of them:

- [`packages/processor`](https://github.com/tivac/modular-css/tree/main/packages/processor) - The `Processor` is the main piece of infrastructure for the entire project. It's a wrapper around a series of [postcss](http://postcss.org/) pipelines and plugins that handles all of the functionality like `composes`, `@value`, and the rest.
- [`packages/rollup`](https://github.com/tivac/modular-css/tree/main/packages/rollup) - [rollup](https://rollupjs.org/) plugin that acts as an interface between the rollup process and a `Processor` instance.
- [`packages/webpack`](https://github.com/tivac/modular-css/tree/main/packages/webpack) - [webpack](https://webpack.js.org/) loader & plugin which acts as an interface between the webpack process and a `Processor` instance.
- [`packages/browserify`](https://github.com/tivac/modular-css/tree/main/packages/browserify) - [browserify](http://browserify.org/) loader & plugin which acts as an interface between the webpack process and a `Processor` instance.

There's several other ways to use `modular-css` tucked away in the `packages/` folders, feel free to peruse the `README.md` files to get more details about each package.

## Reporting Issues

Open an issue and check out the issue template, provide as much info as you can! A github repo that will reliably reproduce the issue is by far the fastest way to get traction on getting your issue fixed.

## Proposing Changes

Open an issue, or maybe stop by [gitter](https://gitter.im/modular-css/modular-css/) and let's chat about it!

## Pull Requests

The PR template lays out expectations around tests passing and documentation. The docs in particular aren't where they should be yet but by golly we'll get 'em there together!
