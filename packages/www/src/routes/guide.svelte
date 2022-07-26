<script context="module">
/* Just a redirect to /overview */
export async function load() {
    return {
        status   : 301,
        redirect : "/overview/",
    };
}
</script>
