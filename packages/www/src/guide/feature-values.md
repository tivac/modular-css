### Values

Values are re-usable pieces of content that can be used instead of hardcoding colors, sizes, media queries, or most other forms of CSS values. They're automatically replaced during the build with their defined value, and can also be composed between files for further re-use or overriding. They're effectively static versions of CSS variables, but with a few extra build-time powers we'll get into later.

::: repl values.css
```css
@value alert: #F00;
@value small: (max-width: 600px);

@media small {
    .alert { color: alert; }
}

/* OUTPUTS */
@media (max-width: 600px) {
    .alert { color: #F00; }
}
```
:::
