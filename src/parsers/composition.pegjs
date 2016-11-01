// fooga
// fooga-wooga
// fooga_wooga
// global(fooga)
// fooga, wooga
// fooga, global(wooga)
// fooga from "./wooga"
// fooga, wooga from "./tooga"
// * as wooga from "booga"

start
    =	namespaced
    / composition
    / bare_references

// Helpers
_ "whitespace"
    = [ \t\n\r]*

s "string"
    = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
    / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }
  
// Partials
ref "reference"
    = "global(" _ ref:reference _ ")" { return { name : ref, global : true }; }
    / ref:reference { return { name : ref }; }
  
references "references"
    = _ refs:(ref:ref ("," _)? { return ref })+ _ { return refs; }

reference "reference"
    = chars:[a-z0-9-_]i+ { return chars.join(""); }

source
    = _ "from" _ source:s {
        return {
            source
        };
    }

// Patterns
namespaced
    = _ "*" _ "as" _ ref:reference source:source {
      return Object.assign(source, {
          refs : [
              { name : ref, namespace : true}
          ]
      });
    }
  
composition
    = refs:references source:source {
        return Object.assign(source, { refs });
    }

bare_references
    = refs:references {
        return {
            refs,
            source : false
        };
    }
