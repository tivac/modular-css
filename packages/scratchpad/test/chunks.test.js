"use strict";

const construct = require("./construct.js");

require("./snapshot.js");

const chunks = require("../chunks.js");

describe("chunking algorithm", () => {
    it("should handle very simple chunking", () => {
        const { entries, graph } = construct([ "a", "b" ], `
            a -> A
            A -> C
            A -> D
            b -> B
            B -> D
        `);

        expect(chunks({ entries, graph })).toMatchChunksSnapshot();
    });
    
    it("should handle more simple chunking", () => {
        const { entries, graph } = construct([ "a", "b" ], `
            a -> A
            A -> D
            b -> B
            B -> C
            C -> D
        `);

        expect(chunks({ entries, graph })).toMatchChunksSnapshot();
    });
    
    it("should handle more complicated chunking", () => {
        const { entries, graph } = construct([ "a", "b" ], `
            a -> A
            b -> B
            A -> C
            A -> D
            C -> E
            E -> F
            B -> F
            F -> G
        `);

        expect(chunks({ entries, graph })).toMatchChunksSnapshot();
    });
    
    it("should handle unmergable chunks", () => {
        const { entries, graph } = construct([ "a", "b", "c" ], `
            a -> A
            b -> B
            c -> C
            A -> B
            B -> C
        `);
    
        expect(chunks({ entries, graph })).toMatchChunksSnapshot();
    });
});
