<div class="{styles.wrapper}">
    <h1 class="{styles.hd}">Head</h1>
    <div class="{styles.bd}">
        <p class="{bool ? styles.text : styles.active }">Text</p>
    </div>
</div>

<script context="module">
	export const prerender = true;
</script>

<script>
    import styles from "./external.css";

    const bool = false;
</script>
