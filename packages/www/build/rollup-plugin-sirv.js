"use strict";

const sirv = require("sirv");
const polka = require("polka");
const getport = require("get-port");

const { dest } = require("./environment.js");

module.exports = () => {
    let started = false;
    
    return {
        name : "rollup-plugin-sirv",

        async buildStart() {
            if(started) {
                return;
            }

            started = true;

            const assets = sirv(dest, { dev : true });

            const port = await getport({ port : 3000 });

            await polka()
                .use(assets)
                .listen(port);
            
            // eslint-disable-next-line no-console
            console.log(`Server listening on localhost:${port}`);
        }
    };
};
