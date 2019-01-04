import path from "rollup-plugin-node-builtins/src/es6/path.js";
import parse from "path-parse";

// Need to manually add path.parse because it's not included in the base polyfill
path.parse = parse;

export default path;
