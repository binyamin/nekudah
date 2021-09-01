import path, { relative, resolve } from "node:path";

import { watch as createWatcher } from "chokidar";
import log from "signale-logger";

import {Engine} from "./nekuda/index.js";
import { utils } from "./nekuda/index.js";

const {copyDir, walk, copyFile, readJSON, readYAML } = utils.fs;

const dirs = {
    html: resolve("src"),
    assets: resolve("static"),
    // out: "/var/www/html/dashboard/out"
    out: resolve("out"),
}

log.config({
    displayLabel: false
})

const env = new Engine({ src: dirs.html, out: dirs.out })
env.addGlobal("bookmarks", await readJSON("./bookmarks.json"))
env.addGlobal("home", await readYAML("./home.yaml"))
env.addFilter("log", (...v) => console.log(...v));

async function build() {
    await copyDir(dirs.assets, dirs.out)

    const templates = (await walk(dirs.html))
    .map(f => {
        return relative(dirs.html, f);
    })
    .filter(f => {
        /**
         * @todo Use underscore convention...
         * - If file starts with underscore, ignore file
         * - If folder starts with underscore, ignore children recursively
         */
        return !f.startsWith("_partials") && f !== "macros.html";
    })

    for(const t of templates) {
        env.renderToFile(t);
    }
    log.success("Build complete")
}

/** @todo This list should be built programmatically, and rebuilt when files change */
const ftree = [
    {
        filepath: "_partials/layout.html",
        dependents: [
            "index.html",
            "links.html"
        ]
    },
    {
        filepath: "macros.html",
        dependents: [
            "index.html",
            "links.html"
        ]
    }
];

function watch() {
    const watcher = createWatcher([dirs.html, dirs.assets]);
    log.watch("Recursively watching src and static directories");

    watcher.on("change", async (fpath, _fstats) => {
        const [rootdir, ...rest] = relative(process.cwd(), fpath).split(path.sep)
        const relpath = rest.join(path.sep);
        console.log(rootdir)

        if(rootdir === path.basename(dirs.assets)) {
            const outpath = resolve(dirs.out, relpath);
            await copyFile(fpath, outpath);
            log.info("Copied asset", relpath);
        } else if(rootdir === path.basename(dirs.html)) {
            env.renderToFile(relpath);
            return

            // The rest of this is for incremental building
            const fnode = ftree.find(o => o.filepath === relpath);
            log.debug("changed:", relpath)

            if(!!fnode) {
                // file is a partial
                fnode.dependents.forEach(p => {
                    log.debug("rendering:", p)
                    // render the templates which extend it
                    env.renderToFile(p);
                })
            } else {
                log.debug("rendering:", relpath)
                /** @todo partials which aren't imported should still be ignored */
                // file is a template
                env.renderToFile(relpath);
            }
        } else {
            log.error(new Error("path is not watched by chokidar: " + fpath));
        }
    })
    
    process.on("SIGINT", process.exit)
    process.on("exit", () => {
        log.success("Exiting...");
        watcher.unwatch();
        process.exit(127);
    })
}


const cmd = process.argv.slice(2)[0];

if(cmd === "build") {
    await build();
} else if (cmd === "watch") {
    watch();
} else {
    log.error(new Error("Command not recognized"))
    process.exit(127)
}