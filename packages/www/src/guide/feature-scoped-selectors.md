### Selector Scoping

By default all CSS selectors live in the global scope of the page and are chosen based on specificity rules. This has proven to be a model that makes it difficult to succeed and incredibly easy to dig yourself into a hole you can't climb out of. `modular-css` scopes all selectors to the local file by default, ensuring that your CSS is always exactly as specific as it should be.

::: repl
```css
.wooga {
    color: red;
}
```
:::

will be output as

```css
.mcf250d69f_wooga {
    color: red;
}
```

By default the selector scoping is based off hashing the contents of the file but you can also provide your own custom function.

Using these now-mangled selectors would be problematic, if `modular-css` didn't give you the tools required to use them easily. When using the browserify transform any `require()` calls for CSS files will instead return an object where the keys match the classes/ids defined in the requested CSS file.

```js
var css = require("./styles.css");

// css is:
/*
{
    wooga : "mcf250d69f_wooga",
    booga : "mcf250d69f_wooga mcf250d69f_booga",
    ...
}
*/

// So then you can render that class trivially
const html = `<div class="${css.wooga}">Wooga</div>`;

// which then has the properly scoped selector
// <div class="mcf250d69f_wooga">Wooga</div>

// Also easy-to-use with JSX!
const jsx = <div class={css.wooga}>Wooga</div>;
```

These arrays of selectors can then be applied to elements using the much more nicely-named object keys and you're off to the races.

You can opt out of selector scoping by wrapping your classes/ids in the `:global()` pseudo-class, this will prevent them from being renamed but they will still be available in the module's exported object.

::: repl
```css
:global(.global) {
    color: red;
}
```
:::

when transformed to JS looks like this

```js
var css = require("./styles.css");

// css is:
/*
{
    global : "global"
}
*/
```

Selector scoping is **only** done on simple classes/ids, any selectors containing tags or pseudo-selectors won't be exported.

`:global()` is treated the same as a CSS pseudo-class and therefore cannot wrap multiple comma seperated rules. For example if you're using a CSS reset the following is required:

::: repl
```css
/* Local Scoped */
ol, ul {
    list-style: none;
}

/* Global Scoped (Wrong!) */
:global(ol, ul) {
    list-style: none;
}

/* Global Scoped (Correct!) */
:global(ol), :global(ul) {
    list-style: none;
}
```
:::

Adding `:global()` to every comma seperated rule would be tedious when using something like [Eric Meyer's CSS Reset](http://meyerweb.com/eric/tools/css/reset/). Therefore it is recommended that you seperate the reset in to its own file, and make use of the [postcss-import](https://github.com/postcss/postcss-import) module with the [after](/api#after-hook) or [done](/api#done-hook) hooks to include the file when modular-css has finished processing. You would then need to include `@import "reset.css";` somewhere in one of your CSS files.
