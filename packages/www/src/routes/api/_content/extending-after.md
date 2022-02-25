### `after`

The `after` hook is run once the output location for the CSS is known, but before all the files are combined. By default it will run [`postcss-url`](https://github.com/postcss/postcss-url) to rebase file references based on the final output location, but this can be disabled using the [`rewrite`](#rewrite) option.

Since all manipulations on the file are complete at this point it is a good place to run plugins like [`postcss-import`](https://github.com/postcss/postcss-import) to inline `@import` rules. The rules inlined in this way won't be scoped so it's a convenient way to pull in 3rd party code which can be included in the selector heirarchy via `composes`.

```css
@import "bootstrap.css";

/* Will export as "btn .abc123_button" */
.button {
    composes: global(btn);
}
```

#### Usage

Specify an array of PostCSS plugins to be run after files are processed, but before they are combined. Plugin will be passed a `to` and `from` option.

**Default**: `[]`

⚠ [`postcss-url`](https://www.npmjs.com/package/postcss-url) automatically runs after any plugins defined in the `after` hook. To disable it use the [`rewrite`](#rewrite) option.

```javascript
new Processor({
    after : [ require("postcss-someplugin") ]
});
```
