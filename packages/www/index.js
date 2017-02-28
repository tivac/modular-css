import Processor from "modular-css-core";

var processor = new Processor();

processor.string("/test.css", ".fooga { animation-name: none; }")
    .then(() => processor.output())
    .then(console.log.bind(console));
