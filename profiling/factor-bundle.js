var profiler = require("v8-profiler"),
    build;

profiler.startProfiling();

build = require("browserify")([
    "./test/specimens/factor-bundle-a.js",
    "./test/specimens/factor-bundle-b.js"
]);

build.plugin("./src/browserify", {
    css : "./test/output/browserify-factor-bundle.css"
});

build.plugin("factor-bundle", {
    outputs : [
        "./test/output/factor-bundle-a.js",
        "./test/output/factor-bundle-b.js"
    ]
});

build.bundle(function() {
    profiler.stopProfiling().export().pipe(require("fs").createWriteStream("./profiling/factor-bundle.cpuprofile"));
});
