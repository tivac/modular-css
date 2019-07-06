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
```
