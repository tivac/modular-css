// * as wooga from "booga"
// fooga from "./wooga"
// fooga, wooga from "./tooga"
// fooga, global(wooga) from "./tooga"
// fooga: wooga

start
    = namespaced
    / composition
    / assignment

// HELPERS //

// Patterns
namespaced
    = _ "*" _ "as" _ ref:ident source:source { return Object.assign(
        source, {
            refs : [
                { name : ref, namespace : true}
            ]
        });
    }

composition
    = refs:references source:source { return Object.assign(source, { refs }); }

assignment
    = name:reference _ ":" _ value:.+ { return { name, value : value.join("") }; }
