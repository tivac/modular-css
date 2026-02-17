<script>
import { resolve } from "$app/paths";

import { version } from "../../../package.json";
import css from "./header.mcss";
</script>

<div class={css.header}>
    <a href={resolve("/")} class={css.name}>modular-css</a>
    <a href={resolve("/changelog/")} class={css.version}>v{version}</a>

    <div class={css.links}>
        <a href={resolve("/overview/")} class={css.link}>Overview</a>
        <a href={resolve("/api/")} class={css.link}>API</a>
        <a href={resolve("/repl/")} class={css.link}>REPL</a>
        <a href="https://github.com/tivac/modular-css" class={css.link}>
            GitHub
        </a>
    </div>
</div>
