### `before` hook

The `before` hook is run before a CSS file is ever processed by `modular-css`, so it provides access to rewrite files if they aren't actually CSS or contain non-standard syntax. Plugins like [`postcss-nested`](https://github.com/postcss/postcss-nested) go well here.


#### Using the `before` hook

Specify an array of PostCSS plugins to be run against each file before it is processed. Plugin will be passed a `from` option.

```js
new Processor({
    before : [ require("postcss-import") ]
});
```
