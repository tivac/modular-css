<div class="{css.wrapper}">
    <h1 class="{css.hd}">Head</h1>
    <div class="{css.bd}">
        <p class="{bool ? css.text : css.active }">Text</p>
    </div>
</div>

<style>
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

<script>
export default {
    data : () => ({
        bool : true
    })
};
</script>
