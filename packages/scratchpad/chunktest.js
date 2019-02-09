/* eslint-disable no-console */
const chunks = require("./chunks.js");
const construct = require("./test/construct.js");

// const { entries, graph } = construct([ "a", "b", "c" ], `
// a -> A
// b -> B
// c -> C
// A -> B
// B -> C
// `);

// const { entries, graph } = construct([ "a", "b" ], `
//     a -> A
//     b -> B
//     A -> C
//     A -> D
//     C -> E
//     E -> F
//     B -> F
//     F -> G
// `);

const { entries, graph } = construct([ "a", "b" ], `
a -> A
b -> B
A -> D
A -> C
B -> D
D -> E
E -> F
E -> G
C -> F
`);

const result = chunks({ entries, graph });

console.log("FILE OUTPUT");

entries.forEach((entry) => {
    console.log("ENTRY:", entry);

    result.dependenciesOf(entry)
    .map((node) => console.log(node, " ", result.getNodeData(node)));
});

console.log("====");
