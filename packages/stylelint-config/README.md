@modular-css/stylelint-config  [![NPM Version](https://img.shields.io/npm/v/@modular-css/stylelint-config.svg)](https://www.npmjs.com/package/@modular-css/stylelint-config) [![NPM License](https://img.shields.io/npm/l/@modular-css/stylelint-config.svg)](https://www.npmjs.com/package/@modular-css/stylelint-config) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/stylelint-config.svg)](https://www.npmjs.com/package/@modular-css/stylelint-config)
===========

<p align="center">
    <a href="https://gitter.im/modular-css/modular-css"><img src="https://img.shields.io/gitter/room/modular-css/modular-css.svg" alt="Gitter" /></a>
</p>

Sharable stylelint config for [`modular-css`](https://m-css). By default stylelint will complain about things like `@value`, `@composes`, `composes: fooga;`, and other bits of custom modular-css syntax. This configures the relevant stylelint rules so that those bits of functionality are ignored so that you don't get a bunch of bogus warnings or errors for using modular-css.

Someday it might even validate things for you, but that's a trickier proposition. For now not barfing errors/warnings everywhere is a good start.

- [Install](#install)
- [Usage](#usage)

## Install

```bash
> npm i @modular-css/stylelint -D
```

## Usage

Inside your [stylelint config](https://stylelint.io/user-guide/configuration/) you'll specify an [`extends`](https://stylelint.io/user-guide/configuration/#extends) property pointing to this package.

```js
{
    "extends" : "@modular-css/stylelint-config",
    "rules" : {
        // ...
    }
}
```
