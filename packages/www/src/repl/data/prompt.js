const prompt = `
/* Here's some simple examples to get you started! */

/* Selector Scoping */
.fooga { color: red; }

/* Selector composition */
.booga {
    composes: fooga;
    
    background: blue;
}

/* Values */
@value fgColor: green;

.wooga {
    color: fgColor;
}
`;

export {
    prompt,
};
