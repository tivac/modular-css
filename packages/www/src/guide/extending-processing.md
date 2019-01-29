### `processing` hook

The `processing` hook is run after `modular-css` has parsed the file, but before any response to [`processor.string`](api.md#string) or [`processor.file`](api.md#file) is returned. Plugins in this hook have a special power: they can change the exports of the file.

This works by having the plugin push an object onto the `result.messages` array. Here's a very simple example:

```js
new Processor({
    processing : [
        (css, result) => {
            result.messages.push({
                plugin  : "modular-css-exporter",
                exports : {
                    a : true,
                    b : false
                }
            });
        }
    ]
})
```

The `plugin` field must begin with "modular-css-export", and the `exports` field should be the object to be mixed into the exports of the CSS file. It will be added last, so it can be used to override the default exports if desired.

#### `processing` usage

Specify an array of PostCSS plugins to be run against each file during processing. Plugin will be passed a `from` option.

```js
new Processor({
    processing : [ require("postcss-import") ]
});
```
