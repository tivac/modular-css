<link rel="stylesheet" href="./external.css">

<div class="{css.wrapper}">
    <h1 class="{css.hd}">Head</h1>
    <div class="{css.bd}">
        <p class="{bool ? css.text : css.active }">Text</p>
    </div>
</div>

<script>
export default {
    data : () => ({
        bool : true
    }),

    oncreate() {
        const bd = {
            flex : "flex"
        };

        const style = css[bd.flex];
    }
};
</script>
