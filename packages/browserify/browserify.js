"use strict";

const fs   = require("fs");
const path = require("path");
const through = require("through2");
const sink    = require("sink-transform");
const mkdirp  = require("mkdirp");
const each    = require("p-each-series");
const Processor = require("@modular-css/processor");
const relative  = require("@modular-css/processor/lib/relative.js");
const output    = require("@modular-css/processor/lib/output.js");
const prefixRegex = /^\.\.?\//;

const prefixed = (cwd, file) => {
    let out = relative(cwd, file);

    if(!prefixRegex.test(out)) {
        out = `./${out}`;
    }

    return out;
};

const outputs = (processor, file) => {
    const details = processor.files[file];

    const classes = output.fileCompositions(details, processor, { joined : true });
    const values = output.values(details.values);
    
    // Attach values to the compositions
    classes.$values = values;

    return `module.exports = ${JSON.stringify(classes, null, 4)};`;
};

module.exports = (browserify, opts) => {
    const options = {
        __proto__ : null,

        ext   : ".css",
        map   : browserify._options.debug,
        cwd   : browserify._options.basedir || process.cwd(),
        cache : true,
        ...opts,
    };

    let processor = options.cache && new Processor(options);
    let bundler;
    let bundles;
    let handled;

    if(!options.ext || options.ext.charAt(0) !== ".") {
        return browserify.emit("error", `Missing or invalid "ext" option: ${options.ext}`);
    }

    function depReducer(curr, next) {
        curr[prefixed(options.cwd, next)] = next;

        return curr;
    }

    function write(files, to) {
        return processor.output({
            files,
            to,
        })
        .then(({ css, map }) => {
            fs.writeFileSync(to, css, "utf8");

            if(map) {
                fs.writeFileSync(
                    `${to}.map`,
                    map.toString(),
                    "utf8"
                );
            }
        })
        .catch((error) => bundler.emit("error", error));
    }

    browserify.transform((file) => {
        if(path.extname(file) !== options.ext) {
            return through();
        }

        return sink.str(function(buffer, done) {
            const push = this.push.bind(this);
            const real = fs.realpathSync(file);

            processor.string(real, buffer).then(
                (result) => {
                    // Tell watchers about dependencies by emitting "file" events
                    // AFAIK this is only useful to watchify, to ensure that it watches
                    // everyone in the dependency graph
                    processor.dependencies(result.id).forEach((dep) =>
                        browserify.emit("file", dep, dep)
                    );

                    push(outputs(processor, file));

                    done();
                },

                (error) => {
                    // Thrown from the current bundler instance, NOT the main browserify
                    // instance. This is so that watchify won't explode.
                    bundler.emit("error", error);

                    push(buffer);

                    done();
                }
            );
        });
    });

    // Splice ourselves as early as possible into the deps pipeline
    browserify.pipeline.get("deps").splice(1, 0, through.obj((row, enc, done) => {
        if(path.extname(row.file) !== options.ext) {
            return done(null, row);
        }

        handled[row.id] = true;

        // Ensure that browserify knows about the CSS dependency tree by updating
        // any referenced entries w/ their dependencies
        row.deps = processor.dependencies(row.file).reduce(depReducer, {});

        return done(null, row);
    }, function(done) {
        // Ensure that any CSS dependencies not directly referenced are
        // injected into the stream of files being managed
        const push = this.push.bind(this);

        processor.dependencies().forEach((dep) => {
            if(dep in handled) {
                return;
            }

            push({
                id     : path.resolve(options.cwd, dep),
                file   : path.resolve(options.cwd, dep),
                source : outputs(processor, dep),
                deps   : processor.dependencies(dep).reduce(depReducer, {}),
            });
        });

        done();
    }));

    // Keep tabs on factor-bundle organization
    browserify.on("factor.pipeline", (file, pipeline) => {
        bundles[file] = [];

        // Track the files in each bundle so we can determine commonalities
        // Doesn't actually modify the file, just records it
        pipeline.unshift(through.obj((obj, enc, done) => {
            if(path.extname(obj.file) === options.ext) {
                bundles[file].unshift(obj.file);
            }

            done(null, obj);
        }));
    });

    // Watchify fires update events when files change, this tells the processor
    // to remove the changed files from its cache so they will be re-processed
    browserify.on("update", (files) => {
        files.forEach((file) => {
            processor.invalidate(file);
        });
    });

    return browserify.on("bundle", (current) => {
        // Calls to .bundle() means we should recreate anything tracking bundling progress
        // in case things have changed out from under us, like when using watchify
        bundles = {};
        handled = {};

        // cache set to false means we need to create a new Processor each run-through
        if(!options.cache) {
            processor = new Processor(options);
        }

        bundler = current;

        // Listen for bundling to finish
        bundler.on("end", () => {
            const bundling = Object.keys(bundles).length > 0;

            if(options.json) {
                mkdirp.sync(path.dirname(options.json));

                fs.writeFileSync(
                    options.json,
                    JSON.stringify(output.compositions(processor), null, 4)
                );
            }

            if(!options.css) {
                return;
            }

            const common = processor.dependencies();

            mkdirp.sync(path.dirname(options.css));

            // Write out each bundle's CSS files (if they have any)
            each(
                Object.keys(bundles).map((key) => ({
                    bundle : key,
                    files  : bundles[key],
                })),
                (details) => {
                    const { bundle, files } = details;

                    if(!files.length && !options.empty) {
                        return Promise.resolve();
                    }

                    // This file was part of a bundle, so remove from the common file
                    files.forEach((file) =>
                        common.splice(common.indexOf(file), 1)
                    );

                    const dest = path.join(
                        path.dirname(options.css),
                        `${path.basename(bundle, path.extname(bundle))}.css`
                    );

                    mkdirp.sync(path.dirname(dest));

                    return write(files, dest);
                }
            )
            .then(() => {
                // No common CSS files to write out, so don't (unless they asked nicely)
                if(!common.length && !options.empty) {
                    return Promise.resolve();
                }

                return write(bundling && common, options.css);
            });
        });
    });
};
