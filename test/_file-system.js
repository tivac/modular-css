"use strict";

module.exports = {
    folder : {
        "folder.css" :
            "@value folder: white;\n" +
            ".folder { margin: 2px; }\n"
    },
    
    invalid : {
        "composition.css" : ".wooga { composes: fake from \"../local.css\"; }\n",
        "value.css"       : "@value not-real from \"../local.css\";\n"
    },
    
    node_modules : {
        "test-styles" : {
            "styles.css" : ".booga { color: white; }\n"
        }
    },
    
    "client.js" :
        "\"use strict\";\n" +
        "require(\"./start.css\");\n",
    
    "start.css" :
        "@value one, two, folder from \"./local.css\";\n" +
        ".wooga { composes: booga from \"./local.css\"; }\n" +
        ".booga { color: one; background: two; }\n" +
        ".tooga { border: 1px solid folder; }",
    
    "local.css" :
        "@value one: red;\n" +
        "@value two: blue;\n" +
        "@value folder from \"./folder/folder.css\";\n" +
        ".booga { background: green; }\n" +
        ".looga { composes: booga; }\n",
    
    "node_modules.css" :
        ".wooga { composes: booga from \"test-styles/styles.css\"; }\n" +
        ".booga { color: one; background: two; }\n"
};
