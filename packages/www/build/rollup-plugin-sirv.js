"use strict";

const sirv = require("sirv");
const polka = require("polka");
const getport = require("get-port");

module.exports = () => {
    if(!process.env.ROLLUP_WATCH) {
        return {};
    }

    let started = false;
    
    return {
        name : "rollup-plugin-sirv",

        async buildStart() {
            if(started) {
                return;
            }

            started = true;

            const assets = sirv("./dist", { dev : true });

            const port = await getport({ port : 3000 });

            await polka()
                .use(assets)
                .listen(port);
            
            console.log(`Server listening on localhost:${port}`);
        }
    };
};
