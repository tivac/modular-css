### `done` hook

The `done` hook is run after all of the constituent files are combined into a single stylesheet. This makes it a good place to add tools like [`cssnano`](http://cssnano.co/) that need access to the entire stylesheet to be able to accurately optimize the CSS.

#### Using the `done` hook

Specify an array of PostCSS plugins to be run against the complete combined CSS. Plugin will be passed a `to` option.

```javascript
new Processor({
    done : [ require("cssnano")()]
});
```
