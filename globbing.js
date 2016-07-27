var g = require("./src/glob");

g({ patterns : [ "**/*.css", "!**/node_modules/**" ], cwd : "./test/specimens/glob" });
