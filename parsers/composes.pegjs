start
    = composition
    / global
    / namespaced
    / simple

// fooga from "./wooga"
// fooga, wooga from "./tooga"
composition
    = refs:references source:from_source {
        return {
            type : "composition",
            source,
            refs
        };
    }

// fooga from global
// fooga, wooga from global
global
    = refs:references _ "from" _ global_keyword {
        return {
            type : "simple",
            refs: refs.map(({ name }) => ({ name, global : true }))
        };
    }

// fooga.booga
namespaced
    = ns:ident "." ref:ident {
        return {
            type : "namespaced",
            ns,
            ref
        };
    }

// fooga
// fooga, wooga
simple
    = refs:references {
        return {
            type : "simple",
            refs
        };
    }
