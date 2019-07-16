#### Overriding Styles

Sometimes a component will need some customization for use in a specific location/design, but you don't want to bake that customization into the component.`:external(...)` helps you solve that problem.

In this case we've got an `input` component that is normally 100% of the width of its container, but when it's within the `fieldset` component it should only be half as wide.

```css
/* == input.css == */
.input {
    width: 100%;
}

/* == fieldset.css == */
.fieldset :external(input from "./input.css") {
    width: 50%;
}

/* == Output == */
.mcd8e24dd1_input {
    width: 100%;
}

.mcf250d69f_fieldset .mcd8e24dd1_input {
    width: 50%;
}
```

[REPL Link](https://m-css.com/repl/#NrBEHoFsEMEsDsB0BjAzq0AaUiBmsBTAGwBNUCAXAAgC4CAPCggJ3miIAoEAHAV2tzMA9pCoAdHOHxECAZhToJASioBvMfCpaqAd1gkKACxpUArAAYApAG4NAX1ABdTGCmwZ8tBmyIe-NRrauvpGJgCM5la28A6OjkA)
