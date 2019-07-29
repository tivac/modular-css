<link href="./header.css" />

<div class="{css.header}">
    <div class="{css.title}">
        <a href="/" class="{css.name}">modular-css</a>
        <a href="/changelog/" class="{css.version}">v{version}</a>
    </div>

    <ul class="{css.navitems}">
    {#each links as { text, url, external }}
        <li class="{css.navitem}">
            <a href="{url}" class="{css.link}">{text}</a>
        </li>
    {/each}
    </ul>
</div>

<script>
import { version } from "../package.json";

const links = [
    {
        text : "Overview",
        url  : "/guide/",
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
        text : "Chat",
        url  : "https://gitter.im/modular-css/modular-css",
    },
    {
        text : "GitHub",
        url  : "https://github.com/tivac/modular-css",
    },
];
</script>
