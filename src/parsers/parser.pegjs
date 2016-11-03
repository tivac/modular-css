start
    = create_namespace
    / assignment
    / composition
    / namespaced
    / simple

// Helpers
_ "whitespace"
    = [ \t\n\r]*

s "string"
    = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
    / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }
  
// Partials

// wooga
ident "identifier"
    = chars:[a-z0-9-_]i+ { return chars.join(""); }

// wooga
// global(wooga)
reference "reference"
    = "global(" _ ref:ident _ ")" { return { name : ref, global : true }; }
    / ref:ident { return { name : ref }; }
 
// wooga
// wooga, tooga
references "references"
    = _ head:reference tail:(_ "," _ ref:reference { return ref; })* _ { return [ head ].concat(tail); }

// "./wooga.css"
source "source"
    = s

// from "./wooga"
from_source
    = _ "from" _ source:source {
        return source;
    }

// Patterns

// @value only

// * as fooga from "./wooga"
create_namespace
    = _ "*" _ "as" _ name:ident source:from_source {
        return {
            type   : "namespace",
            source,
            name
        };
    }

// fooga: booga
assignment
    = ref:reference _ ":" _ value:.+ {
        return {
            type  : "assignment",
            name  : ref.name,
            value : value.join("")
        };
    }

// @value or composes:

// fooga from "./wooga"
// fooga, wooga from "./tooga"
composition
    = refs:references source:from_source {
        return {
            type   : "composition",
            source,
            refs
        };
    }

// composes: only

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
            refs : refs.map((ref) => ref.name)
        };
    }
