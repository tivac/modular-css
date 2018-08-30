# @modular-css/shortnames

A [`namer`](./api.md#namer) function to provide tiny classnames for production builds.

## Usage

See [README.md](../packages/namer/README.md).

## Example output

```css
/* one.css */
.alert {}
.notification {}

/* two.css */
.title {}
.heading .subheading {}
```

becomes

```css
/* output.css */
.AA {}
.AB {}

.BA {}
.BB .BC {}
```
