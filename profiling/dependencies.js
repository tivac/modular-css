var profiler = require("v8-profiler"),
    build;

profiler.startProfiling();

build = require("browserify")("./test/specimens/start.js");

build.plugin("./src/browserify", {
    css : "./test/output/browserify-include-css-deps.css"
});

build.bundle(function() {
    profiler.stopProfiling().export().pipe(require("fs").createWriteStream("./profiling/dependencies.cpuprofile"));
});
