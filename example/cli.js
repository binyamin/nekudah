#! /usr/bin/env node

import lib from '..index.js';

const cmd = process.argv.slice(2)[0];

switch (cmd) {
    case "build":
        await lib.build();
        break;
    case "watch":
        lib.watch();
        break;
    case "serve":
        // lib.watch();
        lib.serve();
        break;
    case undefined:
        console.log("Please provide either `watch`, `serve`, or `build`.")
        process.exit(0);
        break;
    default:
        console.error(`Command "${cmd}" not recognized`);
        process.exit(1);
        // break;
}
