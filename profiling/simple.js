var profiler = require("v8-profiler"),
    build;

profiler.startProfiling();
    
build = require("browserify")("../test/specimens/simple.js");

build.plugin("./src/browserify");

build.bundle(function() {
    profiler.stopProfiling().export().pipe(require("fs").createWriteStream("./profiling/simple.cpuprofile"));
});
