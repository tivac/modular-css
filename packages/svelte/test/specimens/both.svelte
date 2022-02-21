<div class="{css.wrapper}">
    <h1 class="{css.hd}">Head</h1>
    <div class="{css.bd}">
        <p class="{true ? css.text : css.active }">Text</p>
    </div>
</div>

<link rel="stylesheet" href="./external.css">

<style type="text/m-css">
    .flex {
        display: flex;
    }

    .wrapper {
        composes: flex;
    }

    .hd {
        composes: flex;
        composes: fooga from "./simple.css";
    }

    .bd {
        composes: wooga from "./dependencies.css";
    }

    .text {
        color: #000;
    }

    .active {
        color: #F00;
    }
</style>
