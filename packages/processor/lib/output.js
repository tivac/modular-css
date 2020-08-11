"use strict";

const map = require("lodash/mapValues");

const relative = require("./relative.js");
const { SELECTOR_PREFIX, selectorKey } = require("./keys.js");

exports.join = (output) =>
    map(output, (classes) => (
        Array.isArray(classes) ?
            classes.join(" ") :
            classes.toString()
    ));

exports.compositions = ({ options, files, graph }) => {
    const { cwd } = options;
    const json = Object.create(null);

    Object.keys(files)
        .sort()
        .forEach((file) => {
            const { exports : classes } = files[file];
            const out = Object.create(null);

            Object.keys(classes).forEach((selector) => {
                const key = selectorKey(file, selector);
                const compositions = [];

                if(graph.hasNode(key)) {
                    graph.dependenciesOf(key).forEach((dep) => {
                        if(!dep.startsWith(SELECTOR_PREFIX)) {
                            return;
                        }

                        const {
                            file : depFile,
                            selector : depSelector,
                            global,
                        } = graph.getNodeData(dep);

                        if(global) {
                            compositions.push(depSelector);
                        } else {
                            const composition = files[depFile].exports[depSelector];

                            compositions.push(...(Array.isArray(composition) ? composition : [ composition ]));
                        }
                    });
                }

                compositions.push(...classes[selector]);

                out[selector] = compositions.join(" ");
            });

            json[relative(cwd, file)] = out;
        });

    return json;
};
