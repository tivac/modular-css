# Extending

There are 4 built-in ways to extend the functionality of `modular-css`, the lifecycle hooks. They all can be used to add any number of [PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md) to `modular-css` at specific points in the processing cycle.

## `before` hook

The `before` hook is run before a CSS file is ever processed by `modular-css`, so it provides access to rewrite files if they aren't actually CSS or contain non-standard syntax. Plugins like [`postcss-nested`](https://github.com/postcss/postcss-nested) go well here.


### `before` usage

Specify an array of PostCSS plugins to be run against each file before it is processed. Plugin will be passed a `from` option.

```js
new Processor({
    before : [ require("postcss-import") ]
});
```

## `processing` hook

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

### `processing` usage

Specify an array of PostCSS plugins to be run against each file during processing. Plugin will be passed a `from` option.

```js
new Processor({
    processing : [ require("postcss-import") ]
});
```

## `after` hook

The `after` hook is run once the output location for the CSS is known, but before all the files are combined. By default it will run [`postcss-url`](https://github.com/postcss/postcss-url) to rebase file references based on the final output location, but this can be disabled using the [`rewrite`](api.md#rewrite) option.

Since all manipulations on the file are complete at this point it is a good place to run plugins like [`postcss-import`](https://github.com/postcss/postcss-import) to inline `@import` rules. The rules inlined in this way won't be scoped so it's a convenient way to pull in 3rd party code which can be included in the selector heirarchy via `composes`.

```css
@import "bootstrap.css";

/* Will export as "btn .abc123_button" */
.button {
    composes: global(btn);
}
```

### `after` usage

Specify an array of PostCSS plugins to be run after files are processed, but before they are combined. Plugin will be passed a `to` and `from` option.

**Default**: `[]`

:warning: [`postcss-url`](https://www.npmjs.com/package/postcss-url) automatically runs after any plugins defined in the `after` hook. To disable it use the [`rewrite`](#rewrite) option.

```js
new Processor({
    after : [ require("postcss-someplugin") ]
});
```

## `done` hook

The `done` hook is run after all of the constituent files are combined into a single stylesheet. This makes it a good place to add tools like [`cssnano`](http://cssnano.co/) that need access to the entire stylesheet to be able to accurately optimize the CSS.

### `done` usage

Specify an array of PostCSS plugins to be run against the complete combined CSS. Plugin will be passed a `to` option.

```js
new Processor({
    done : [ require("cssnano")()]
});
```
