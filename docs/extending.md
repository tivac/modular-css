# Extending `modular-css`

There are 4 built-in ways to extend the functionality of `modular-css`, the lifecycle hooks. They all can be used to add any number of [PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md) to `modular-css` at specific points in the processing cycle.

The lifecycle hooks are:

1. [`before`](#before)
1. [`processing`](#processing)
1. [`after`](#after)
1. [`done`](#done)

## `before`

[API](api.md#before)

---

The `before` hook is run before a CSS file is ever processed by `modular-css`, so it provides access to rewrite files if they aren't actually CSS or contain non-standard syntax. Plugins like [`postcss-nested`](https://github.com/postcss/postcss-nested) go well here.

## `processing`

[API](api.md#processing)

---

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

## `after`

[API](api.md#after)

---

The `after` hook is run once the output location for the CSS is known, but before all the files are combined. By default it will run [`postcss-url`](https://github.com/postcss/postcss-url) to rebase file references based on the final output location, but this can be disabled using the [`rewrite`](api.md#rewrite) option.

Since all manipulations on the file are complete at this point it is a good place to run plugins like [`postcss-import`](https://github.com/postcss/postcss-import) to inline `@import` rules. The rules inlined in this way won't be scoped so it's a convenient way to pull in 3rd party code which can be included in the selector heirarchy via `composes`.

```css
@import "bootstrap.css";

/* Will export as "btn .abc123_button" */
.button {
    composes: global(btn);
}
```

## `done`

[API](api.md#done)

---

The `done` hook is run after all of the constituent files are combined into a single stylesheet. This makes it a good place to add tools like [`cssnano`](http://cssnano.co/) that need access to the entire stylesheet to be able to accurately optimize the CSS.
