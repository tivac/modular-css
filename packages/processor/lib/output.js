"use strict";

const relative = require("./relative.js");
const { SELECTOR_PREFIX, selectorKey } = require("./keys.js");

exports.join = (value) => (Array.isArray(value) ?
    value.join(" ") :
    value.toString()
);

exports.fileCompositions = ({ classes, name }, { files, graph }, { joined = false } = false) => {
    const out = Object.create(null);

    Object.keys(classes).forEach((selector) => {
        const key = selectorKey(name, selector);
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
                    const composition = files[depFile].classes[depSelector];

                    compositions.push(...(Array.isArray(composition) ? composition : [ composition ]));
                }
            });
        }

        compositions.push(...classes[selector]);

        out[selector] = joined ? exports.join(compositions) : compositions;
    });

    return out;
};

exports.compositions = (processor) => {
    const { options, files } = processor;
    const { cwd } = options;
    const json = Object.create(null);

    Object.keys(files)
        .sort()
        .forEach((file) => {
            const out = exports.fileCompositions(files[file], processor);

            json[relative(cwd, file)] = out;
        });
    
    return json;
};

exports.json = (compositions) => Object.keys(compositions).reduce((acc, file) => {
    acc[file] = Object.keys(compositions[file]).reduce((out, selector) => {
        out[selector] = exports.join(compositions[file][selector]);

        return out;
    }, Object.create(null));

    return acc;
}, Object.create(null));

exports.values = (values) => Object.keys(values).reduce((acc, key) => {
    acc[key] = values[key].value;

    return acc;
}, Object.create(null));
