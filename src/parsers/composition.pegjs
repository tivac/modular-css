// fooga from "./wooga"
// fooga, wooga from "./tooga"
// fooga
// fooga-wooga
// fooga_wooga
// global(fooga)
// fooga, wooga
// fooga, global(wooga)

start
    = composition
    / simple

// HELPERS //

// Patterns
composition
    = refs:references source:source {
        return Object.assign(source, { refs });
    }

simple
    = refs:references {
        return {
            refs,
            source : false
        };
    }
