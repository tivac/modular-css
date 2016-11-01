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
s "string"
  = "\"" chars:[^\"\r\n]* "\"" { return chars.join(""); }
  / "\'" chars:[^\'\r\n]* "\'" { return chars.join(""); }
  
ws "whitespace"
  = [ \t\n\r]*
  
q "quote"
  = [\"\']

ref "reference"
  = "global(" ws ref:reference ws ")" { return { name : ref, global : true }; }
  / ref:reference { return { name : ref }; }
  
references "references"
  = ws refs:(ref:ref ("," ws)? { return ref })+ ws { return refs; }

reference "reference"
  = chars:[a-z0-9-_]i+ { return chars.join(""); }

// Parts
namespaced
  = ws "*" ws "as" ws ref:reference ws "from" ws source:s { return {
    refs : [
      { name : ref, namespace : true}
    ],
    source : source
  }; }
  
composition
  = refs:references ws "from" ws source:s { return { refs, source }; }

bare_references
  = refs:references { return { refs, source : false }; }
