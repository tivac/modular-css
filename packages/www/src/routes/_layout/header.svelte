<script>
import { resolve } from "$app/paths";

import css from "./header.mcss";
</script>

<div class={css.header}>
    <a href={resolve("/")} class={css.name}>modular-css</a>
    <a href="https://github.com/tivac/modular-css/releases" class={css.version}>
        Release Info
    </a>

    <div class={css.links}>
        <a href={resolve("/overview/")} class={css.link}>Overview</a>
        <a href={resolve("/api/")} class={css.link}>API</a>
        <a href={resolve("/repl/")} class={css.link}>REPL</a>
        <a href="https://github.com/tivac/modular-css" class={css.link}>
            GitHub
        </a>
    </div>
</div>
