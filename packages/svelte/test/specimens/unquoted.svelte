<div class={css.b}>
    I'm not quoted lol
    <div class={css.a}>Me either!</div>
</div>

<div class="{css.b}">
    But I am!
</div>

<style type="text/m-css">
    .a {
        color: red;
    }

    .b {
        composes: a;
    }
</style>
