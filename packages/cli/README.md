@modular-css/cli  [![NPM Version](https://img.shields.io/npm/v/@modular-css/cli.svg)](https://www.npmjs.com/package/@modular-css/cli) [![NPM License](https://img.shields.io/npm/l/@modular-css/cli.svg)](https://www.npmjs.com/package/@modular-css/cli) [![NPM Downloads](https://img.shields.io/npm/dm/@modular-css/cli.svg)](https://www.npmjs.com/package/@modular-css/cli)
===========

CLI interface to [`modular-css`](https://github.com/tivac/modular-css).

- [Install](#install)
- [Usage](#usage)

## Install

```bash
$ npm i @modular-css/cli
```

## Usage

```
$ modular-css [options] <glob>...

Options
--dir,     -d <dir>    Directory to search from [process cwd]
--out,     -o <file>   File to write output CSS to [stdout]
--json,    -j <file>   File to write output compositions JSON to
--map,     -m          Include inline source map in output
--rewrite, -r          Control rewriting of url() references in CSS
--help                 Show this help
```
