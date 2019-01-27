### Values

Values are re-usable pieces of content that can be used instead of hardcoding colors, sizes, media queries, or most other forms of CSS values. They're automatically replaced during the build with their defined value, and can also be composed between files for further re-use or overriding.

```css
/* == values.css == */
@value alert: #F00;
@value small: (max-width: 600px);

@media small {
    .alert { color: alert; }
}

/* will be output as */

@media (max-width: 600px) {
    .alert { color: #F00; }
}
```
