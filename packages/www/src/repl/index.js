import hash from "./hash.js";

import Repl from "./repl.svelte";

new Repl({
    target : document.body,
});

hash();
