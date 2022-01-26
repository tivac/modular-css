<link href="./header.mcss" />

<div class="{css.header}">
    <a href="/" class="{css.name}">modular-css</a>
    <a href="/changelog/" class="{css.version}">v{version}</a>
    
    <div class="{css.links}">
    {#each links as { text, url, external }}
        <a href="{url}" class="{css.link}">{text}</a>
    {/each}
    </div>
</div>

<script>
import { version } from "../../../package.json";
// import css from "./header.mcss";

const links = [
    {
        text : "Overview",
        url  : "/overview/",
    },
    {
        text : "API",
        url  : "/api/",
    },
    {
        text : "REPL",
        url  : "/repl/",
    },
    {
        text : "GitHub",
        url  : "https://github.com/tivac/modular-css",
    },
];
</script>
